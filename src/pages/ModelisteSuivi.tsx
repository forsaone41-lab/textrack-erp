import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, CheckCircle2, Clock, Search, 
  RefreshCw, MessageCircle, Printer, 
  Scissors, Tag, Calendar, User as UserIcon, Eye, X, 
  Check, DollarSign, Wallet, ShieldCheck,
  ChevronRight, Sparkles, Filter
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { 
  FicheTechnique, Commande, Facture, User, Lead,
  loadData, saveRecord 
} from '../types';
import { supabase } from '../supabase';
import { printFacture } from '../utils/print';

interface ModelisteSuiviProps {
  currentUser: User;
}

export interface ModelItem {
  id: string;
  sourceType: 'lead' | 'fiche';
  modele: string;
  client: string;
  phone?: string;
  ville?: string;
  photo?: string;
  date: string;
  patronagePrice: number;
  patronageStatus: 'requested' | 'priced';
  patronageNotes?: string;
  isValidatedByClient: boolean;
  validationStatus: 'valide' | 'echantillon_en_cours' | 'attente';
  paymentStatus: 'payee' | 'partiel' | 'en_attente' | 'non_facture';
  montantDevis: number;
  montantFacture: number;
  montantPaye: number;
  resteAPayer: number;
  modelisteId?: string;
  modelisteName?: string;
  lead?: Lead;
  fiche?: FicheTechnique;
  commande?: Commande;
  devis?: Facture;
  facture?: Facture;
}

export default function ModelisteSuivi({ currentUser }: ModelisteSuiviProps) {
  const { isAr } = useLang();
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'en_attente_client' | 'payes' | 'en_attente_paiement'>('all');
  const [selectedModelisteId, setSelectedModelisteId] = useState<string>(isAdmin ? 'all' : currentUser.id);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, cmdsData, factsData, fichesData, usersData] = await Promise.all([
        supabase
          .from('leads')
          .select('id, name, phone, ville, type, quantity, status, date, details, photo, crmStage, crmPrice, crmPriceConfirmed')
          .not('name', 'in', '(__SYSTEM_CONFIG__,__WORKER_PHOTO__,__SYSTEM_LISTE_ATTENTE__,__DELETED__)')
          .order('date', { ascending: false })
          .limit(250),
        loadData<Commande>('commandes'),
        loadData<Facture>('factures'),
        loadData<FicheTechnique>('fiches'),
        loadData<User>('users')
      ]);

      setLeads(leadsRes.data || []);
      setCommandes(cmdsData || []);
      setFactures(factsData || []);
      setFiches(fichesData || []);
      setUsers(usersData || []);
    } catch (e) {
      console.error('Erreur chargement données Modéliste:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter modelistes for admin dropdown selector
  const modelistes = useMemo(() => {
    return users.filter(u => u.role === 'modeliste');
  }, [users]);

  // Correlate Patronage Leads, Fiches, Commandes, Devis and Factures
  const modelItems: ModelItem[] = useMemo(() => {
    const items: ModelItem[] = [];

    // 1. Process Leads sent for patronage evaluation (EvaluationPatronage)
    leads.forEach(lead => {
      let ext: any = {};
      try { ext = JSON.parse(lead.details || '{}'); } catch(e) {}

      // Must be a lead where patronage was requested or priced
      const isPatronageLead = ext.patronageStatus === 'requested' || 
                              ext.patronageStatus === 'priced' || 
                              Boolean(ext.patronagePrice);
      if (!isPatronageLead) return;

      const normClient = (lead.name || '').toLowerCase().trim();
      const normModele = (lead.type || '').toLowerCase().trim();

      // Find matching Commande for this client/model
      const cmd = commandes.find(c => {
        const cClient = (c.client || '').toLowerCase().trim();
        const cModele = (c.modele || '').toLowerCase().trim();
        return (cClient && (cClient === normClient || cClient.includes(normClient) || normClient.includes(cClient))) ||
               (cModele && normModele && (cModele === normModele || cModele.includes(normModele) || normModele.includes(cModele)));
      });

      // Find matching Devis (typeDoc === 'devis')
      const devis = factures.find(f => {
        if (f.typeDoc !== 'devis') return false;
        if (cmd && f.commandeId === cmd.id) return true;
        const fClient = (f.client || '').toLowerCase().trim();
        return fClient && (fClient === normClient || fClient.includes(normClient) || normClient.includes(fClient));
      });

      // Find matching Facture (typeDoc !== 'devis' && typeDoc !== 'recu')
      const facture = factures.find(f => {
        if (f.typeDoc === 'devis' || f.typeDoc === 'recu') return false;
        if (cmd && f.commandeId === cmd.id) return true;
        const fClient = (f.client || '').toLowerCase().trim();
        return fClient && (fClient === normClient || fClient.includes(normClient) || normClient.includes(fClient));
      });

      // Client validation status:
      // Validated when client accepted, crmStage is 'confirme', status is 'completed', crmPriceConfirmed is true,
      // or cmd status is echantillon_valide/en_cours/terminé/livré, or facture exists/paid
      const isValidated = Boolean(
        ext.clientValidated === true ||
        lead.crmStage === 'confirme' ||
        lead.status === 'completed' ||
        lead.crmPriceConfirmed === true ||
        (cmd && ['echantillon_valide', 'en_cours', 'terminé', 'livré'].includes(cmd.statut)) ||
        (facture && ['payée', 'en_cours'].includes(facture.statut)) ||
        (devis && devis.statut === 'payée')
      );

      const valStatus: 'valide' | 'echantillon_en_cours' | 'attente' = isValidated 
        ? 'valide' 
        : (cmd?.statut === 'echantillon_en_cours' ? 'echantillon_en_cours' : 'attente');

      const patPrice = Number(ext.patronagePrice) || 0;
      const mDevis = devis ? devis.montant : 0;
      const mFacture = facture ? facture.montant : (cmd ? (cmd.prix * (cmd.quantite || 1)) : patPrice);
      let mPaye = 0;
      let pStatus: 'payee' | 'partiel' | 'en_attente' | 'non_facture' = 'non_facture';

      if (facture) {
        if (facture.statut === 'payée') {
          pStatus = 'payee';
          mPaye = facture.montant;
        } else if (facture.avance && facture.avance > 0) {
          pStatus = 'partiel';
          mPaye = facture.avance;
        } else {
          pStatus = 'en_attente';
          mPaye = 0;
        }
      } else if (cmd && cmd.avance && cmd.avance > 0) {
        mPaye = cmd.avance;
        pStatus = (cmd.avance >= mFacture && mFacture > 0) ? 'payee' : 'partiel';
      } else if (ext.patronagePaid === true) {
        pStatus = 'payee';
        mPaye = patPrice;
      } else if (isValidated) {
        pStatus = 'en_attente';
      }

      const mReste = Math.max(0, mFacture - mPaye);

      items.push({
        id: lead.id,
        sourceType: 'lead',
        modele: lead.type || 'Modèle Référence',
        client: lead.name || 'Client',
        phone: lead.phone,
        ville: lead.ville,
        photo: lead.photo,
        date: lead.date ? new Date(lead.date).toLocaleDateString('fr-FR') : '—',
        patronagePrice: patPrice,
        patronageStatus: ext.patronageStatus || (patPrice > 0 ? 'priced' : 'requested'),
        patronageNotes: ext.patronageNotes || '',
        isValidatedByClient: isValidated,
        validationStatus: valStatus,
        paymentStatus: pStatus,
        montantDevis: mDevis,
        montantFacture: mFacture,
        montantPaye: mPaye,
        resteAPayer: mReste,
        modelisteId: ext.modelisteId,
        modelisteName: ext.modelisteName,
        lead,
        commande: cmd,
        devis,
        facture
      });
    });

    // 2. Process any Fiches Techniques explicitly assigned to a modeliste
    fiches.forEach(fiche => {
      if (!fiche.modelisteId) return;

      const normFicheModele = (fiche.modele || '').toLowerCase().trim();
      const normFicheClient = (fiche.client || '').toLowerCase().trim();

      const alreadyInLead = items.some(it => 
        it.modele.toLowerCase().trim() === normFicheModele && 
        it.client.toLowerCase().trim() === normFicheClient
      );
      if (alreadyInLead) return;

      const cmd = commandes.find(c => {
        const cClient = (c.client || '').toLowerCase().trim();
        const cModele = (c.modele || '').toLowerCase().trim();
        return (cClient === normFicheClient) && (cModele === normFicheModele || cModele.includes(normFicheModele));
      });

      const devis = factures.find(f => f.typeDoc === 'devis' && (f.client || '').toLowerCase().trim() === normFicheClient);
      const facture = factures.find(f => f.typeDoc !== 'devis' && f.typeDoc !== 'recu' && (f.client || '').toLowerCase().trim() === normFicheClient);

      const isValidated = Boolean(cmd && ['echantillon_valide', 'en_cours', 'terminé', 'livré'].includes(cmd.statut));
      const valStatus: 'valide' | 'echantillon_en_cours' | 'attente' = isValidated ? 'valide' : (cmd?.statut === 'echantillon_en_cours' ? 'echantillon_en_cours' : 'attente');

      const mDevis = devis ? devis.montant : 0;
      let mFacture = facture ? facture.montant : (cmd ? (cmd.prix * (cmd.quantite || 1)) : 0);
      let mPaye = 0;
      let pStatus: 'payee' | 'partiel' | 'en_attente' | 'non_facture' = 'non_facture';

      if (facture) {
        if (facture.statut === 'payée') {
          pStatus = 'payee';
          mPaye = facture.montant;
        } else if (facture.avance && facture.avance > 0) {
          pStatus = 'partiel';
          mPaye = facture.avance;
        } else {
          pStatus = 'en_attente';
        }
      } else if (cmd && cmd.avance && cmd.avance > 0) {
        mPaye = cmd.avance;
        pStatus = (cmd.avance >= mFacture && mFacture > 0) ? 'payee' : 'partiel';
      }

      const modUser = users.find(u => u.id === fiche.modelisteId);

      items.push({
        id: fiche.id,
        sourceType: 'fiche',
        modele: fiche.modele,
        client: fiche.client,
        photo: fiche.photo || fiche.patronagePhoto,
        date: fiche.createdAt || '—',
        patronagePrice: 0,
        patronageStatus: 'priced',
        isValidatedByClient: isValidated,
        validationStatus: valStatus,
        paymentStatus: pStatus,
        montantDevis: mDevis,
        montantFacture: mFacture,
        montantPaye: mPaye,
        resteAPayer: Math.max(0, mFacture - mPaye),
        modelisteId: fiche.modelisteId,
        modelisteName: modUser?.nom,
        fiche,
        commande: cmd,
        devis,
        facture
      });
    });

    return items;
  }, [leads, fiches, commandes, factures, users]);

  // Filtered by modeliste role / selection
  const filteredByRole = useMemo(() => {
    if (isAdmin) {
      if (selectedModelisteId === 'all') return modelItems;
      return modelItems.filter(item => item.modelisteId === selectedModelisteId);
    }
    // For modeliste: show models assigned to him or sent to modeliste
    return modelItems.filter(item => {
      if (item.modelisteId && item.modelisteId === currentUser.id) return true;
      if (!item.modelisteId && item.sourceType === 'lead') return true;
      return false;
    });
  }, [modelItems, isAdmin, selectedModelisteId, currentUser.id]);

  // Summary Metrics
  const stats = useMemo(() => {
    const pricedModels = filteredByRole.filter(i => i.patronageStatus === 'priced');
    const validesClient = pricedModels.filter(i => i.isValidatedByClient);
    const enAttenteClient = pricedModels.filter(i => !i.isValidatedByClient);
    const payes = validesClient.filter(i => i.paymentStatus === 'payee');
    const totalPayeMAD = validesClient.reduce((sum, i) => sum + i.montantPaye, 0);
    const totalResteMAD = validesClient.reduce((sum, i) => sum + i.resteAPayer, 0);

    return {
      totalValides: validesClient.length,
      enAttenteClientCount: enAttenteClient.length,
      payesCount: payes.length,
      totalPayeMAD,
      totalResteMAD
    };
  }, [filteredByRole]);

  // Filtered by Tab and Search Query
  // CRITICAL RULE: "Tous" displays ONLY models priced and accepted by client!
  const displayedItems = useMemo(() => {
    return filteredByRole.filter(item => {
      // Must have been priced by modeliste
      if (item.patronageStatus !== 'priced') return false;

      // Tab filter
      if (activeTab === 'all') {
        // "Tous (Validés Client)": Only models validated and accepted by client!
        if (!item.isValidatedByClient) return false;
      } else if (activeTab === 'en_attente_client') {
        // Models waiting for client confirmation
        if (item.isValidatedByClient) return false;
      } else if (activeTab === 'payes') {
        // Models paid
        if (!item.isValidatedByClient || item.paymentStatus !== 'payee') return false;
      } else if (activeTab === 'en_attente_paiement') {
        // Validated by client but payment is pending
        if (!item.isValidatedByClient || item.paymentStatus === 'payee' || item.resteAPayer <= 0) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchModele = (item.modele || '').toLowerCase().includes(q);
        const matchClient = (item.client || '').toLowerCase().includes(q);
        const matchDevis = (item.devis?.numero || '').toLowerCase().includes(q);
        const matchFac = (item.facture?.numero || '').toLowerCase().includes(q);
        return matchModele || matchClient || matchDevis || matchFac;
      }

      return true;
    });
  }, [filteredByRole, activeTab, search]);

  // One-click validation: confirm that client accepted the model
  const handleValidateClient = async (item: ModelItem) => {
    if (!item.lead) return;
    setValidatingId(item.id);
    try {
      let ext: any = {};
      try { ext = JSON.parse(item.lead.details || '{}'); } catch(e) {}
      const newDetails = {
        ...ext,
        clientValidated: true,
        clientValidatedAt: new Date().toISOString(),
        clientValidatedBy: currentUser?.nom || 'Atelier'
      };
      const updatedLead = {
        ...item.lead,
        crmStage: 'confirme' as const,
        status: 'completed' as const,
        crmPriceConfirmed: true,
        details: JSON.stringify(newDetails)
      };
      await saveRecord('leads', updatedLead, true);
      await fetchData();
    } catch (e) {
      console.error('Erreur validation client:', e);
    } finally {
      setValidatingId(null);
    }
  };

  const openWhatsApp = (phone?: string, clientName?: string, modeleName?: string) => {
    if (!phone) {
      alert(isAr ? 'رقم الهاتف غير متوفر' : 'Numéro de téléphone non disponible');
      return;
    }
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '212' + p.substring(1);
    const msg = encodeURIComponent(
      isAr 
        ? `السلام عليكم ${clientName || ''}، بخصوص موديل "${modeleName || ''}"...`
        : `Bonjour ${clientName || ''}, concernant le modèle "${modeleName || ''}"...`
    );
    window.open(`https://wa.me/${p}?text=${msg}`, '_blank');
  };

  return (
    <div className={`space-y-6 ${isAr ? 'rtl font-sans' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Scissors className="w-3.5 h-3.5" />
              <span>{isAr ? 'الموديلات المصادق عليها والمدفوعات' : 'Modèles Validés Client & Règlements'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {isAr ? 'موديلاتي والمدفوعات (Modèles & Règlements)' : 'Mes Modèles & Règlements Clients'}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              {isAr 
                ? 'عرض الموديلات التي سُعِّرت وقَبِلها الزبون حصراً، مع متابعة الدوڤيات والفواتير والمدفوعات المحصلة والمتبقية.'
                : 'Consultez exclusivement les modèles chiffrés et acceptés par le client, ainsi que les devis, factures et paiements encaissés.'
              }
            </p>
          </div>

          {/* Admin selector & Refresh */}
          <div className="flex items-center gap-3">
            {isAdmin && modelistes.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
                <select
                  value={selectedModelisteId}
                  onChange={e => setSelectedModelisteId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-white">{isAr ? 'جميع المودليست' : 'Tous les modélistes'}</option>
                  {modelistes.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">{m.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث' : 'Actualiser'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Metrics Bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Validated Models */}
        <div 
          onClick={() => setActiveTab('all')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
            activeTab === 'all' 
              ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20' 
              : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'مقبولة من الزبون (Tous)' : 'Validés par le Client'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalValides}</div>
          <div className="text-xs text-emerald-600 mt-1 font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            {isAr ? 'موديلات تمت موافقة الزبون عليها' : 'Modèles acceptés et confirmés'}
          </div>
        </div>

        {/* Metric 2: Awaiting Client Confirmation */}
        <div 
          onClick={() => setActiveTab('en_attente_client')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
            activeTab === 'en_attente_client' 
              ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'في انتظار موافقة الزبون' : 'En Attente Client'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{stats.enAttenteClientCount}</div>
          <div className="text-xs text-amber-700/80 mt-1 font-medium">
            {isAr ? 'حُدِّد ثمنها، قيد تأكيد الزبون' : 'Prix fixé, en attente accord'}
          </div>
        </div>

        {/* Metric 3: Paid (Khlas Daz) */}
        <div 
          onClick={() => setActiveTab('payes')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
            activeTab === 'payes' 
              ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' 
              : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'الخلاص داز (مدفوع)' : 'Khlas Daz (Payé)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.totalPayeMAD.toLocaleString('fr-MA')} <span className="text-sm font-bold">MAD</span></div>
          <div className="text-xs text-blue-700/80 mt-1 font-medium">
            {stats.payesCount} {isAr ? 'ملف مسوى بالكامل' : 'dossier(s) réglé(s)'}
          </div>
        </div>

        {/* Metric 4: Pending (Khlas Baqi) */}
        <div 
          onClick={() => setActiveTab('en_attente_paiement')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all ${
            activeTab === 'en_attente_paiement' 
              ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20' 
              : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'الخلاص باقي (معلق)' : 'Khlas Baqi (En Attente)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.totalResteMAD.toLocaleString('fr-MA')} <span className="text-sm font-bold">MAD</span></div>
          <div className="text-xs text-rose-700/80 mt-1 font-medium">
            {isAr ? 'مستحقات قيد التحصيل' : 'Montant restant à encaisser'}
          </div>
        </div>

      </div>

      {/* ─── Search & Tab Filters ──────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {/* TOUS (VALIDÉS CLIENT) */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? `المقبولة من الزبون - الكل (${stats.totalValides})` : `Tous - Validés Client (${stats.totalValides})`}</span>
          </button>
          
          {/* EN ATTENTE ACCORD CLIENT */}
          <button
            onClick={() => setActiveTab('en_attente_client')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'en_attente_client' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? `في انتظار موافقة الزبون (${stats.enAttenteClientCount})` : `En attente client (${stats.enAttenteClientCount})`}</span>
          </button>

          {/* KHLAS DAZ */}
          <button
            onClick={() => setActiveTab('payes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'payes' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isAr ? `الخلاص داز (${stats.payesCount})` : `Khlas Daz (${stats.payesCount})`}</span>
          </button>

          {/* KHLAS BAQI */}
          <button
            onClick={() => setActiveTab('en_attente_paiement')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'en_attente_paiement' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخلاص باقي' : 'Khlas Baqi'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالموديل، الزبون، الفاتورة...' : 'Recherche modèle, client, devis...'}
            className={`w-full ${isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all`}
          />
        </div>

      </div>

      {/* ─── Model Items List ──────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-bold">{isAr ? 'جاري تحميل الموديلات...' : 'Chargement des modèles...'}</p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Scissors className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">
              {activeTab === 'all'
                ? (isAr ? 'لا توجد موديلات مقبولة من طرف الزبون حالياً' : 'Aucun modèle validé par le client pour l\'instant')
                : (isAr ? 'لا توجد نتائج في هذا التبويب' : 'Aucun modèle dans cet onglet')}
            </h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              {activeTab === 'all'
                ? (isAr ? 'الموديلات تظهر هنا تلقائياً بمجرد تحديد ثمن الباترون ومصادقة الزبون على الطلبية، أو يمكنك تصفح الموديلات المعلقة عبر تبويب "في انتظار موافقة الزبون".' : 'Les modèles apparaissent ici dès qu\'ils sont chiffrés et acceptés par le client.')
                : (isAr ? 'لم يتم العثور على أي موديل يوافق البحث أو الفلتر المحدد.' : 'Aucun résultat trouvé pour vos critères de recherche.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedItems.map((item, idx) => {
            const { isValidatedByClient, validationStatus, paymentStatus } = item;

            return (
              <div 
                key={item.id || idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Upper Row: Photo, Modele, Client, Prix Patronage, and Validation Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  
                  <div className="flex items-center gap-4">
                    {/* Thumbnail Photo with Zoom */}
                    <div 
                      onClick={() => item.photo && setZoomImage(item.photo)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative group ${
                        item.photo ? '' : 'cursor-default'
                      }`}
                    >
                      {item.photo ? (
                        <img src={item.photo} alt={item.modele} className="w-full h-full object-cover" />
                      ) : (
                        <Scissors className="w-7 h-7 text-slate-400" />
                      )}
                      {item.photo && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Modele & Client Info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {item.modele}
                        </h3>

                        {/* Patronage Price Badge */}
                        {item.patronagePrice > 0 && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1 shadow-xs">
                            <Scissors className="w-3 h-3 text-emerald-600" />
                            <span>{isAr ? 'أجرة الباترون:' : 'Patronage:'} {item.patronagePrice} MAD</span>
                          </span>
                        )}

                        {item.modelisteName && isAdmin && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {item.modelisteName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          {item.client || (isAr ? 'زبون غير محدد' : 'Client inconnu')}
                        </span>
                        {item.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-600">{item.phone}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Client Validation Badge & WhatsApp quick link */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                    
                    {/* Status Badge */}
                    {isValidatedByClient ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{isAr ? 'مقبول من طرف الزبون ✅' : 'Validé par le client ✅'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAr ? 'في انتظار موافقة الزبون' : 'En attente client'}</span>
                        </div>

                        {/* One-click validate client acceptance button */}
                        <button
                          onClick={() => handleValidateClient(item)}
                          disabled={validatingId === item.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 disabled:opacity-50"
                          title={isAr ? 'تأكيد موافقة وقبول الزبون لهذا الموديل' : 'Confirmer l\'accord du client'}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تأكيد قبول الزبون' : 'Valider client'}</span>
                        </button>
                      </div>
                    )}

                    {/* WhatsApp button */}
                    {item.phone && (
                      <button
                        onClick={() => openWhatsApp(item.phone, item.client, item.modele)}
                        title={isAr ? 'مراسلة عبر واتساب' : 'Contacter sur WhatsApp'}
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

                {/* Lower Row: Devis, Facture, and Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  
                  {/* Devis (Quote) Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        {isAr ? 'عرض السعر (Devis)' : 'Devis Associé'}
                      </span>
                      {item.devis && (
                        <button
                          onClick={() => printFacture(item.devis!, item.commande)}
                          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{isAr ? 'طباعة / عرض' : 'Voir'}</span>
                        </button>
                      )}
                    </div>

                    {item.devis ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.devis.numero}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {item.devis.montant.toLocaleString('fr-MA')} MAD
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        {isAr ? 'لا يوجد عرض سعر مرتبط' : 'Aucun devis lié'}
                      </div>
                    )}
                  </div>

                  {/* Facture (Invoice) Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        {isAr ? 'الفاتورة (Facture)' : 'Facture Associée'}
                      </span>
                      {item.facture && (
                        <button
                          onClick={() => printFacture(item.facture!, item.commande)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{isAr ? 'طباعة / عرض' : 'Voir'}</span>
                        </button>
                      )}
                    </div>

                    {item.facture ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.facture.numero}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {item.facture.montant.toLocaleString('fr-MA')} MAD
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        {isAr ? 'في انتظار إصدار الفاتورة' : 'Pas de facture émise'}
                      </div>
                    )}
                  </div>

                  {/* Payment Status Box (Khlas Daz / Khlas Baqi) */}
                  <div className={`p-3.5 rounded-xl border space-y-2 ${
                    paymentStatus === 'payee'
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : paymentStatus === 'partiel'
                      ? 'bg-blue-50/60 border-blue-100'
                      : paymentStatus === 'en_attente'
                      ? 'bg-amber-50/60 border-amber-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {isAr ? 'حالة الخلاص' : 'Statut Paiement'}
                      </span>

                      {/* Payment Badge */}
                      {paymentStatus === 'payee' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                          {isAr ? 'الخلاص داز ✅' : 'Payé (Khlas Daz) ✅'}
                        </span>
                      ) : paymentStatus === 'partiel' ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase">
                          {isAr ? 'تسبيق مؤدى ⚡' : 'Avance Réglée'}
                        </span>
                      ) : paymentStatus === 'en_attente' ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase">
                          {isAr ? 'الخلاص باقي ⏳' : 'En Attente (Khlas Baqi) ⏳'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isAr ? 'غير مفوتر' : 'Non facturé'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">
                        {isAr ? 'المؤدى:' : 'Réglé:'} <b className="text-slate-800">{item.montantPaye.toLocaleString('fr-MA')} MAD</b>
                      </span>
                      {item.resteAPayer > 0 && (
                        <span className="text-amber-700">
                          {isAr ? 'الباقي:' : 'Reste:'} <b className="font-bold">{item.resteAPayer.toLocaleString('fr-MA')} MAD</b>
                        </span>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ─── Image Zoom Modal ──────────────────────────────────── */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={zoomImage} 
              alt="Zoom Patronage" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
