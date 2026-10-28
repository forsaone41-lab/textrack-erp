import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, CheckCircle2, Clock, AlertCircle, Search, 
  RefreshCw, MessageCircle, Phone, Printer, ExternalLink, 
  Scissors, Tag, Calendar, User as UserIcon, Eye, X, 
  Check, ArrowUpRight, DollarSign, Wallet, ShieldCheck,
  ChevronRight, Sparkles, Layers
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { 
  FicheTechnique, Commande, Facture, User, 
  loadData 
} from '../types';
import { printFacture } from '../utils/print';

interface ModelisteSuiviProps {
  currentUser: User;
}

interface ModelItem {
  fiche: FicheTechnique;
  commande?: Commande;
  devis?: Facture;
  facture?: Facture;
  isValidatedByClient: boolean;
  validationStatus: 'valide' | 'echantillon_en_cours' | 'attente';
  paymentStatus: 'payee' | 'partiel' | 'en_attente' | 'non_facture';
  montantDevis: number;
  montantFacture: number;
  montantPaye: number;
  resteAPayer: number;
  modelisteName?: string;
}

export default function ModelisteSuivi({ currentUser }: ModelisteSuiviProps) {
  const { lang, isAr } = useLang();
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'valides' | 'payes' | 'en_attente'>('all');
  const [selectedModelisteId, setSelectedModelisteId] = useState<string>(isAdmin ? 'all' : currentUser.id);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fichesData, cmdsData, factsData, usersData] = await Promise.all([
        loadData<FicheTechnique>('fiches'),
        loadData<Commande>('commandes'),
        loadData<Facture>('factures'),
        loadData<User>('users')
      ]);

      setFiches(fichesData || []);
      setCommandes(cmdsData || []);
      setFactures(factsData || []);
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

  // Filter modelistes for admin selector
  const modelistes = useMemo(() => {
    return users.filter(u => u.role === 'modeliste');
  }, [users]);

  // Correlate Fiches, Commandes, Devis and Factures
  const modelItems: ModelItem[] = useMemo(() => {
    return fiches.map(fiche => {
      // Find matching Commande for this model
      const cmd = commandes.find(c => {
        if (!c.modele) return false;
        const normCmdModele = c.modele.toLowerCase().trim();
        const normFicheModele = (fiche.modele || '').toLowerCase().trim();
        const normCmdClient = (c.client || '').toLowerCase().trim();
        const normFicheClient = (fiche.client || '').toLowerCase().trim();
        
        return normCmdModele === normFicheModele || 
               (normCmdClient === normFicheClient && normCmdModele.includes(normFicheModele));
      });

      // Find matching Devis (typeDoc === 'devis')
      const devis = factures.find(f => {
        if (f.typeDoc !== 'devis') return false;
        if (cmd && f.commandeId === cmd.id) return true;
        const matchClient = (f.client || '').toLowerCase().trim() === (fiche.client || '').toLowerCase().trim();
        const matchArticle = f.articles?.some(a => (a.designation || '').toLowerCase().includes(fiche.modele.toLowerCase()));
        return matchClient && (matchArticle || f.articles?.length === 0);
      });

      // Find matching Facture (typeDoc !== 'devis' && typeDoc !== 'recu')
      const facture = factures.find(f => {
        if (f.typeDoc === 'devis' || f.typeDoc === 'recu') return false;
        if (cmd && f.commandeId === cmd.id) return true;
        const matchClient = (f.client || '').toLowerCase().trim() === (fiche.client || '').toLowerCase().trim();
        const matchArticle = f.articles?.some(a => (a.designation || '').toLowerCase().includes(fiche.modele.toLowerCase()));
        return matchClient && (matchArticle || !f.articles || f.articles.length === 0);
      });

      // Validation status logic
      let isValidated = false;
      let valStatus: 'valide' | 'echantillon_en_cours' | 'attente' = 'attente';

      if (cmd) {
        if (cmd.statut === 'echantillon_valide' || cmd.statut === 'en_cours' || cmd.statut === 'terminé' || cmd.statut === 'livré') {
          isValidated = true;
          valStatus = 'valide';
        } else if (cmd.statut === 'echantillon_en_cours') {
          valStatus = 'echantillon_en_cours';
        }
      }

      // Financial status logic
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
          mPaye = 0;
        }
      } else if (cmd && cmd.avance && cmd.avance > 0) {
        mPaye = cmd.avance;
        pStatus = (cmd.avance >= mFacture && mFacture > 0) ? 'payee' : 'partiel';
      }

      const mReste = Math.max(0, mFacture - mPaye);

      // Modeliste name
      const modUser = users.find(u => u.id === fiche.modelisteId);
      const modName = modUser ? modUser.nom : undefined;

      return {
        fiche,
        commande: cmd,
        devis,
        facture,
        isValidatedByClient: isValidated,
        validationStatus: valStatus,
        paymentStatus: pStatus,
        montantDevis: mDevis,
        montantFacture: mFacture,
        montantPaye: mPaye,
        resteAPayer: mReste,
        modelisteName: modName
      };
    });
  }, [fiches, commandes, factures, users]);

  // Filtered by modeliste role / selection
  const filteredByRole = useMemo(() => {
    if (isAdmin) {
      if (selectedModelisteId === 'all') return modelItems;
      return modelItems.filter(item => item.fiche.modelisteId === selectedModelisteId);
    }
    // For modeliste: show their models or models assigned to them
    return modelItems.filter(item => {
      if (item.fiche.modelisteId === currentUser.id) return true;
      // If unassigned but user is modeliste, allow view if empty modelisteId
      if (!item.fiche.modelisteId) return true;
      return false;
    });
  }, [modelItems, isAdmin, selectedModelisteId, currentUser.id]);

  // Filtered by tab and search query
  const displayedItems = useMemo(() => {
    return filteredByRole.filter(item => {
      // Tab filter
      if (activeTab === 'valides' && !item.isValidatedByClient) return false;
      if (activeTab === 'payes' && item.paymentStatus !== 'payee') return false;
      if (activeTab === 'en_attente' && (item.paymentStatus === 'payee' || item.paymentStatus === 'non_facture')) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchModele = (item.fiche.modele || '').toLowerCase().includes(q);
        const matchClient = (item.fiche.client || '').toLowerCase().includes(q);
        const matchDevis = (item.devis?.numero || '').toLowerCase().includes(q);
        const matchFac = (item.facture?.numero || '').toLowerCase().includes(q);
        return matchModele || matchClient || matchDevis || matchFac;
      }

      return true;
    });
  }, [filteredByRole, activeTab, search]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = filteredByRole.length;
    const valides = filteredByRole.filter(i => i.isValidatedByClient).length;
    const payesCount = filteredByRole.filter(i => i.paymentStatus === 'payee').length;
    const totalPayeMAD = filteredByRole.reduce((sum, i) => sum + i.montantPaye, 0);
    const totalResteMAD = filteredByRole.reduce((sum, i) => sum + i.resteAPayer, 0);

    return {
      total,
      valides,
      payesCount,
      totalPayeMAD,
      totalResteMAD
    };
  }, [filteredByRole]);

  const openWhatsApp = (phone?: string, clientName?: string, modeleName?: string) => {
    if (!phone) {
      alert(isAr ? 'رقم الهاتف غير متوفر' : 'Numéro de téléphone non disponible');
      return;
    }
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '212' + p.substring(1);
    const msg = encodeURIComponent(
      isAr 
        ? `السلام عليكم ${clientName || ''}، بخصوص موديل الباترون "${modeleName || ''}"...`
        : `Bonjour ${clientName || ''}, concernant le modèle de patronage "${modeleName || ''}"...`
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'بوابة الموديليست الاحترافية' : 'Espace Modéliste & Validation'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {isAr ? 'موديلاتي والمدفوعات (تتبع القبول والخلاص)' : 'Mes Modèles & Règlements Clients'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium">
              {isAr 
                ? 'تتبع شامل للموديلات التي قمت بتصميمها، حالة قبول الزبون (Accepté)، عروض الأسعار (Devis)، الفواتير (Factures)، ومستحقات الخلاص (واش داز ولا باقي).'
                : 'Suivez en direct l\'acceptation client de vos modèles, les devis émis, les factures et le statut des paiements (encaissés vs en attente).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
                <select
                  value={selectedModelisteId}
                  onChange={e => setSelectedModelisteId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold px-3 py-1.5 outline-none rounded-xl"
                >
                  <option value="all" className="text-slate-900">{isAr ? 'جميع الموديليست' : 'Tous les modélistes'}</option>
                  {modelistes.map(m => (
                    <option key={m.id} value={m.id} className="text-slate-900">{m.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث' : 'Actualiser'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Metric KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Modeles */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'إجمالي الموديلات' : 'Total Modèles'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">
            {isAr ? 'فصل وتصميم باترون' : 'Fiches techniques créées'}
          </div>
        </div>

        {/* Validés par le Client */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {isAr ? 'مقبولة من الزبون' : 'Validés par le Client'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.valides}</div>
          <div className="text-xs text-emerald-700/80 mt-1 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isAr ? 'عينة مقبولة أو طلبية مؤكدة' : 'Échantillon ou commande validé'}
          </div>
        </div>

        {/* Khlas Daz (Paiements Réglés) */}
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {isAr ? 'الخلاص داز (مدفوع)' : 'Khlas Daz (Payé)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.totalPayeMAD.toLocaleString('fr-MA')} <span className="text-sm font-bold">MAD</span></div>
          <div className="text-xs text-blue-600/80 mt-1 font-medium">
            {isAr ? `${stats.payesCount} موديل مسوى بالكامل` : `${stats.payesCount} dossier(s) réglé(s)`}
          </div>
        </div>

        {/* Khlas Baqi (En Attente) */}
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {isAr ? 'الخلاص باقي (في الانتظار)' : 'Khlas Baqi (En Attente)'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.totalResteMAD.toLocaleString('fr-MA')} <span className="text-sm font-bold">MAD</span></div>
          <div className="text-xs text-amber-700/80 mt-1 font-medium">
            {isAr ? 'مستحقات وفواتير معلقة' : 'Montant restant à encaisser'}
          </div>
        </div>

      </div>

      {/* ─── Search & Tab Filters ──────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isAr ? `الكل (${filteredByRole.length})` : `Tous (${filteredByRole.length})`}
          </button>
          
          <button
            onClick={() => setActiveTab('valides')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'valides' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? `مقبولة من الزبون (${stats.valides})` : `Validés Client (${stats.valides})`}
          </button>

          <button
            onClick={() => setActiveTab('payes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'payes' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            {isAr ? `الخلاص داز (${stats.payesCount})` : `Khlas Daz (${stats.payesCount})`}
          </button>

          <button
            onClick={() => setActiveTab('en_attente')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'en_attente' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {isAr ? 'الخلاص باقي' : 'Khlas Baqi'}
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
            <h3 className="text-lg font-black text-slate-800">{isAr ? 'لا توجد موديلات مطابقة' : 'Aucun modèle correspondant'}</h3>
            <p className="text-slate-400 text-xs mt-1">
              {isAr ? 'لم يتم العثور على أي موديل يوافق البحث أو الفلتر المحدد.' : 'Aucun résultat trouvé pour vos critères de recherche.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedItems.map((item, idx) => {
            const { fiche, commande, devis, facture, isValidatedByClient, validationStatus, paymentStatus } = item;

            return (
              <div 
                key={fiche.id || idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Upper Row: Photo, Modele, Client, and Validation Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  
                  <div className="flex items-center gap-4">
                    {/* Thumbnail Photo with Zoom */}
                    <div 
                      onClick={() => (fiche.photo || fiche.patronagePhoto) && setZoomImage(fiche.photo || fiche.patronagePhoto || null)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative group ${
                        fiche.photo || fiche.patronagePhoto ? '' : 'cursor-default'
                      }`}
                    >
                      {fiche.photo ? (
                        <img src={fiche.photo} alt={fiche.modele} className="w-full h-full object-cover" />
                      ) : fiche.patronagePhoto && fiche.patronagePhoto !== 'MANUAL_PATTERN' ? (
                        <img src={fiche.patronagePhoto} alt={fiche.modele} className="w-full h-full object-cover" />
                      ) : (
                        <Scissors className="w-7 h-7 text-slate-400" />
                      )}
                      {(fiche.photo || fiche.patronagePhoto) && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Modele & Client Info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {fiche.modele}
                        </h3>
                        {fiche.type && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                            {fiche.type}
                          </span>
                        )}
                        {item.modelisteName && isAdmin && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {item.modelisteName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          {fiche.client || (isAr ? 'زبون غير محدد' : 'Client inconnu')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {fiche.createdAt || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Client Validation Badge & WhatsApp quick link */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    
                    {/* Status Badge */}
                    {isValidatedByClient ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{isAr ? 'مقبول من الزبون (Validé)' : 'Client Validé (Accepté)'}</span>
                      </div>
                    ) : validationStatus === 'echantillon_en_cours' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>{isAr ? 'عينة قيد التقييم' : 'Échantillon en cours'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{isAr ? 'بطاقة تقنية جاهزة' : 'Fiche technique prête'}</span>
                      </div>
                    )}

                    {/* WhatsApp button */}
                    {commande?.client && (
                      <button
                        onClick={() => openWhatsApp(commande?.referenceClient || commande?.client, fiche.client, fiche.modele)}
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
                      {devis && (
                        <button
                          onClick={() => printFacture(devis, commande)}
                          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{isAr ? 'طباعة / عرض' : 'Voir'}</span>
                        </button>
                      )}
                    </div>

                    {devis ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {devis.numero}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {devis.montant.toLocaleString('fr-MA')} MAD
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
                      {facture && (
                        <button
                          onClick={() => printFacture(facture, commande)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{isAr ? 'طباعة / عرض' : 'Voir'}</span>
                        </button>
                      )}
                    </div>

                    {facture ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {facture.numero}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {facture.montant.toLocaleString('fr-MA')} MAD
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
