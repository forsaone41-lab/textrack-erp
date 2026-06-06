import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Package, ChevronRight, ChevronDown, 
  Edit2, ShoppingCart, Scissors, Trash2, Layers, Binary, AlertTriangle, Check, CheckCircle2, MessageCircle, FastForward, Truck, Settings, X, Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  loadData, saveRecord, deleteRecord, Commande, OrdreDeCoupe, Employe, Phase,
  PHASE_LABELS, PHASE_ORDER, User, FicheTechnique, Lead, loadLeads
} from '../types';
import { useLang } from '../contexts/LangContext';
import { t, T, TKey } from '../i18n';
import { supabase } from '../supabase';
import { PageLoader } from '../components/PageLoader';

export default function Commandes() {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [ordres, setOrdres] = useState<OrdreDeCoupe[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const [filterStatut, setFilterStatut] = useState<'all' | 'echantillon_en_cours' | 'en_cours' | 'terminé' | 'livré'>('all');
  const [filterType, setFilterType] = useState<'all' | 'interne' | 'sous-traitance'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Commande | null>(null);
  const [sendToCoupeConfirm, setSendToCoupeConfirm] = useState<Commande | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  // Quick Sample State
  const [quickSampleModal, setQuickSampleModal] = useState(false);
  const [quickSampleData, setQuickSampleData] = useState({
    modele: '',
    client: '',
    tissu: '',
    couleurs: '',
    taille: 'M',
    photo: ''
  });
  const [creatingSample, setCreatingSample] = useState(false);

  const phaseAr: Record<string, string> = { 
    patronage: 'الباترون', 
    coupe: 'الفصالة', 
    montage: 'الخياطة', 
    finition: 'التشطيب', 
    repassage: 'الكي', 
    controle: 'المراقبة', 
    emballage: 'التغليف', 
    livré: 'مسلّمة' 
  };

  useEffect(() => {
    loadMetadata();
    loadCommands(0, true);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCommands(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterStatut]);

  async function loadMetadata() {
    const [ord, emp, usr, f, l] = await Promise.all([
      loadData<OrdreDeCoupe>('ordres'),
      loadData<Employe>('employes'),
      loadData<User>('users'),
      loadData<FicheTechnique>('fiches'),
      loadLeads()
    ]);
    setOrdres(ord || []);
    setEmployes(emp || []);
    setUsers(usr || []);
    setFiches(f || []);
    setLeads(l || []);
  }

  const downloadFile = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function loadCommands(pageIdx: number, reset: boolean = false) {
    if (loading) return;
    setLoading(true);
    try {
      const from = pageIdx * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('commandes')
        .select('*')
        .order('dateCommande', { ascending: false })
        .range(from, to);

      if (search) {
        query = query.or(`reference.ilike.%${search}%,client.ilike.%${search}%,modele.ilike.%${search}%`);
      }

      if (filterStatut !== 'all') {
        query = query.eq('statut', filterStatut);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        setCommandes(prev => reset ? data : [...prev, ...data]);
        setHasMore(data.length === ITEMS_PER_PAGE);
        setPage(pageIdx);
      }
    } catch (e) {
      console.error("Error loading commands:", e);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return commandes.filter(c => {
      const hasExternal = !!(
        (c.partenaireId && typeof c.partenaireId === 'string' && c.partenaireId.trim().length > 0) || 
        (Array.isArray(c.externalTasks) && c.externalTasks.some(t => t.partenaireId && t.partenaireId.trim().length > 0))
      );
      const matchType = filterType === 'all' || 
        (filterType === 'interne' && !hasExternal) ||
        (filterType === 'sous-traitance' && hasExternal);

      return matchType;
    });
  }, [commandes, filterType]);

  async function notifyClientWhatsApp(c: Commande, message: string) {
    try {
      const allUsers = await loadData<any>('users');
      const user = allUsers.find((u: any) =>
        (u.nom || '').toLowerCase() === (c.client || '').toLowerCase()
      );
      const phone = user?.telephone || user?.phone || '';
      if (!phone) return;
      const raw = phone.replace(/\D/g, '');
      let formatted = raw;
      if (raw.startsWith('0')) formatted = '212' + raw.substring(1);
      else if (!raw.startsWith('212')) formatted = '212' + raw;
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${formatted}?text=${encoded}`, '_blank');
    } catch (_) {}
  }

  function getDynamicStatus(c: Commande) {

    if ((c.statut as any) === 'annulation_demandee') return { label: '⚠️ Annulation demandée', color: 'bg-orange-50 text-orange-600 animate-pulse', dot: 'bg-orange-500 animate-pulse' };
    if ((c.statut as any) === 'annulé') return { label: '❌ Annulée', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
    if (c.statut === 'livré') return { label: t('status_livree', lang), color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
    if (c.statut === 'terminé') return { label: t('status_terminee', lang), color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
    if (c.statut === 'echantillon_en_cours') return { label: t('echantillon_en_cours', lang), color: 'bg-fuchsia-50 text-fuchsia-600', dot: 'bg-fuchsia-500' };
    
    // Fallback to phase if status is just 'en_cours'
    const phaseKey = `phase_${c.phase}`;
    const label = (T as any)[phaseKey] ? t(phaseKey as any, lang) : (PHASE_LABELS[c.phase as Phase] || c.phase);
    return { label: label, color: 'bg-slate-50 text-slate-600', dot: 'bg-slate-400' };
  }

  function getProgress(c: Commande) {
    const phases: Phase[] = ['coupe', 'montage', 'finition', 'controle'];
    const idx = phases.indexOf(c.phase as Phase);
    if (c.statut === 'terminé' || c.statut === 'livré') return 100;
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / phases.length) * 100);
  }

  async function handleSendToCoupe(c: Commande) {
    setSendToCoupeConfirm(c);
  }

  async function confirmSendToCoupe() {
    if (!sendToCoupeConfirm) return;
    const c = sendToCoupeConfirm;
    try {
      // Use the full object but DELETE heavy fields to avoid payload issues
      const cleanUpdate = { ...c };
      delete (cleanUpdate as any).modelePhoto;
      delete (cleanUpdate as any).tissuPhoto;
      delete (cleanUpdate as any).preuveValidation;
      
      // Update the critical fields
      cleanUpdate.phase = 'coupe' as Phase;
      cleanUpdate.statut = 'en_cours' as any;
      
      await saveRecord('commandes', cleanUpdate);
      setCommandes(prev => prev.map(cmd => cmd.id === c.id ? { ...cmd, ...cleanUpdate } : cmd));
      setShowSuccess(isAr ? 'تم الإرسال للفصالة بنجاح!' : 'Envoyé à la coupe avec succès !');
      setSendToCoupeConfirm(null);
    } catch (e: any) {
      alert(isAr ? `خطأ في الإرسال: ${e.message}` : `Erreur d'envoi: ${e.message}`);
    }
  }

  async function handleCreateQuickSample() {
    if (!quickSampleData.modele || !quickSampleData.client) {
      alert(isAr ? 'المرجو إدخال اسم الموديل واسم الزبون' : 'Veuillez saisir le modèle et le client');
      return;
    }
    setCreatingSample(true);
    try {
      const generateRef = () => 'CMD-' + new Date().getFullYear().toString().substr(-2) + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      const newCmd: Partial<Commande> = {
        reference: generateRef(),
        client: quickSampleData.client,
        modele: quickSampleData.modele,
        type: 'production_neuve',
        statut: 'echantillon_en_cours',
        phase: 'echantillon',
        priorite: 'haute',
        dateCommande: new Date().toISOString(),
        tissu: quickSampleData.tissu,
        quantiteTissuRequis: 0,
        mesures: [{
          taille: quickSampleData.taille,
          quantite: 1,
          terminee: 0,
          couleurs: quickSampleData.couleurs ? quickSampleData.couleurs.split(',').map(c => c.trim()) : []
        }],
        suivi: [{ phase: 'echantillon', date: new Date().toISOString(), note: 'Création Échantillon Rapide' }]
      };
      
      if (quickSampleData.photo) {
        (newCmd as any).modelePhoto = quickSampleData.photo;
      }
      
      const saved = await saveRecord('commandes', newCmd as any);
      setCommandes(prev => [saved as Commande, ...prev]);
      setQuickSampleModal(false);
      setQuickSampleData({ modele: '', client: '', tissu: '', couleurs: '', taille: 'M', photo: '' });
      setShowSuccess(isAr ? 'تم إنشاء العينة السريعة بنجاح!' : 'Échantillon rapide créé avec succès !');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCreatingSample(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      // Cascade delete associated cutting orders
      const associatedOrdres = ordres.filter(o => o.commandeId === deleteConfirm.id);
      for (const o of associatedOrdres) {
        await deleteRecord('ordres', o.id);
      }
      
      // Delete the command itself
      await deleteRecord('commandes', deleteConfirm.id);
      
      // Update local states
      setCommandes(prev => prev.filter(cmd => cmd.id !== deleteConfirm.id));
      setOrdres(prev => prev.filter(o => o.commandeId !== deleteConfirm.id));
      setDeleteConfirm(null);
      setShowSuccess(isAr ? 'تم حذف الطلبية وجميع البيانات المرتبطة بها' : 'Commande et ordres associés supprimés avec succès');
    } catch (e: any) {
      alert(isAr ? 'خطأ في الحذف' : 'Erreur de suppression');
    }
  }

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR') : '—';
  const empName = (id: string) => {
    const e = employes.find(emp => emp.id === id);
    return e ? `${e.prenom} ${e.nom}` : '—';
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header PRO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transform -rotate-3 group-hover:rotate-0 transition-transform">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{t('commandes', lang)}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Workspace de Production</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setQuickSampleModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-fuchsia-600 hover:text-white transition-all shadow-sm active:scale-95 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            {isAr ? 'عينة سريعة' : 'Échantillon Rapide'}
          </button>
          <button 
            onClick={() => navigate('/commandes/manage')}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            {isAr ? 'طلبية جديدة +' : '+ Nouvelle Commande'}
          </button>
        </div>
      </div>
      
      {/* Samples Section */}
      {commandes.filter(c => c.statut === 'echantillon_en_cours').length > 0 && (
        <div className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-[2.5rem] p-8">
           <div className={`flex items-center gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
             <div className="w-10 h-10 bg-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-fuchsia-100">
               <Layers className="w-5 h-5" />
             </div>
             <div className={isAr ? 'text-right' : ''}>
               <h2 className="text-xl font-black text-fuchsia-900 uppercase tracking-tighter">
                 {isAr ? 'عينات بانتظار الإعداد' : 'Échantillons à Masteriser'}
               </h2>
               <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mt-0.5">Configuration Master Setup Requise</p>
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {commandes.filter(c => c.statut === 'echantillon_en_cours').map(c => (
               <div key={c.id} className={`bg-white p-5 rounded-2xl border border-fuchsia-100 shadow-sm flex flex-col gap-4 ${isAr ? 'text-right' : ''}`}>
                  <div className={`flex justify-between items-start ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase text-sm leading-tight">{c.modele}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{c.client}</p>
                    </div>
                    <span className="px-2 py-1 bg-fuchsia-100 text-fuchsia-600 text-[8px] font-black rounded-lg uppercase tracking-widest">Échantillon</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/commandes/manage?edit=${c.id}`)}
                    className="w-full py-3 bg-fuchsia-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Binary className="w-4 h-4" />
                    {t('master_setup' as any, lang)}
                  </button>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Send to Coupe Confirmation Modal */}
      {sendToCoupeConfirm && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300 border border-amber-100">
            <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/10 border-2 border-amber-100/50">
              <Scissors className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">
              {isAr ? 'إرسال للفصالة؟' : 'Envoyer à la coupe ?'}
            </h3>
            <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
              {isAr 
                ? `هل أنت متأكد من رغبتك في إرسال الطلبية ${sendToCoupeConfirm.reference} إلى مرحلة الفصالة؟` 
                : `Voulez-vous vraiment envoyer la commande ${sendToCoupeConfirm.reference} à la coupe ?`}
            </p>
            <div className={`flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setSendToCoupeConfirm(null)} 
                className="flex-1 h-14 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={confirmSendToCoupe} 
                className="flex-1 h-14 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 hover:bg-amber-600 transition-all"
              >
                {isAr ? 'تأكيد الإرسال' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Sample Modal */}
      {quickSampleModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-[2rem] p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300 relative my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setQuickSampleModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl flex items-center justify-center shrink-0">
                <Calculator className="w-7 h-7 text-fuchsia-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {isAr ? 'إطلاق عينة سريعة' : 'Lancer un Échantillon Rapide'}
                </h3>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                  {isAr ? 'بدون بطاقة تقنية (مباشرة إلى الإنتاج)' : 'Sans Fiche Technique (Direct vers la production)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'الزبون' : 'Client'}</label>
                <select
                  value={quickSampleData.client}
                  onChange={e => setQuickSampleData({ ...quickSampleData, client: e.target.value })}
                  className="w-full bg-white border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-fuchsia-500 px-4 py-3 rounded-xl transition-all"
                >
                  <option value="" disabled>{isAr ? '-- اختر الزبون --' : '-- Client --'}</option>
                  {users.filter(u => u.role === 'client' || !u.role).map(u => (
                    <option key={u.id} value={u.nom || u.email}>{u.nom || u.email}</option>
                  ))}
                  {!users.some(u => (u.nom || u.email) === quickSampleData.client) && quickSampleData.client && (
                    <option value={quickSampleData.client}>{quickSampleData.client}</option>
                  )}
                </select>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isAr ? 'الموديل' : 'Modèle'}</label>
                <input
                  type="text"
                  list="modele-suggestions"
                  placeholder={isAr ? 'مثال: قميص أبيض كلاسيكي' : 'ex: Chemise Blanche Classique'}
                  value={quickSampleData.modele}
                  onChange={e => {
                    const val = e.target.value;
                    let photo = quickSampleData.photo;
                    
                    // Auto-fill photo if it matches a FicheTechnique or Lead
                    const matchFiche = fiches.find(f => f.client === quickSampleData.client && f.modele === val);
                    const matchLead = leads.find(l => l.name === quickSampleData.client && l.type === val);
                    
                    if (matchFiche?.photo) photo = matchFiche.photo;
                    else if (matchLead?.photo) photo = matchLead.photo;
                    
                    setQuickSampleData({ ...quickSampleData, modele: val, photo });
                  }}
                  className="w-full bg-white border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-fuchsia-500 px-4 py-3 rounded-xl transition-all"
                />
                {quickSampleData.client && (
                  <datalist id="modele-suggestions">
                    {fiches.filter(f => f.client === quickSampleData.client).map(f => (
                      <option key={f.id} value={f.modele}>{isAr ? 'بطاقة تقنية' : 'Fiche Technique'}</option>
                    ))}
                    {leads.filter(l => l.name === quickSampleData.client).map(l => (
                      <option key={l.id} value={l.type}>{isAr ? 'طلب إنزال' : 'Demande'}</option>
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            {/* Photo Uploader */}
            <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                {isAr ? 'صورة الموديل (اختياري)' : 'Photo du Modèle (Optionnel)'}
              </label>
              {quickSampleData.photo ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={quickSampleData.photo} alt="Modele" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => setQuickSampleData({ ...quickSampleData, photo: '' })}
                      className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:bg-slate-100 hover:border-fuchsia-400 transition-all relative cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setQuickSampleData(prev => ({ ...prev, photo: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer hidden" 
                  />
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm mb-1 text-slate-400 group-hover:text-fuchsia-500 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-fuchsia-500 transition-colors">
                    {isAr ? 'إضافة صورة من الحاسوب' : 'Ajouter une photo'}
                  </span>
                </label>
              )}
            </div>

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{isAr ? 'نوع الثوب (Tissu)' : 'Type de Tissu'}</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['JERSEY', 'POPELINE', 'FLEECE', 'GABARDINE', 'DENIM', 'VISCOSE', 'COTON', 'SATIN', 'CRÊPE'].map(t => (
                      <button
                        key={t}
                        onClick={() => setQuickSampleData({ ...quickSampleData, tissu: t })}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${quickSampleData.tissu.toUpperCase().includes(t) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={isAr ? 'اكتب نوع الثوب...' : 'Taper type de tissu...'}
                    value={quickSampleData.tissu}
                    onChange={e => setQuickSampleData({ ...quickSampleData, tissu: e.target.value })}
                    className="w-full py-3 px-4 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">{isAr ? 'الألوان (Couleurs)' : 'Couleurs'}</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['NOIR', 'BLANC', 'GRIS', 'BLEU MARINE', 'BEIGE', 'ROUGE'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          const current = quickSampleData.couleurs ? quickSampleData.couleurs.split(',').map(x => x.trim()) : [];
                          if (current.includes(c)) {
                            setQuickSampleData({ ...quickSampleData, couleurs: current.filter(x => x !== c).join(', ') });
                          } else {
                            setQuickSampleData({ ...quickSampleData, couleurs: [...current, c].join(', ') });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${quickSampleData.couleurs.includes(c) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={isAr ? 'ألوان أخرى (مفصولة بفاصلة)...' : 'Autres couleurs (séparées par virgule)...'}
                    value={quickSampleData.couleurs}
                    onChange={e => setQuickSampleData({ ...quickSampleData, couleurs: e.target.value })}
                    className="w-full py-3 px-4 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">{isAr ? 'تحديد قياس العينة' : 'Sélectionner la taille de l\'échantillon'}</label>
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button
                      key={s}
                      onClick={() => setQuickSampleData({ ...quickSampleData, taille: s })}
                      className={`flex-1 min-w-[70px] py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${quickSampleData.taille === s ? 'border-fuchsia-500 bg-fuchsia-50 shadow-md' : 'border-slate-100 hover:border-fuchsia-200 bg-white'}`}
                    >
                      <span className={`text-lg font-black ${quickSampleData.taille === s ? 'text-fuchsia-600' : 'text-slate-700'}`}>{s}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${quickSampleData.taille === s ? 'text-fuchsia-400' : 'text-slate-400'}`}>{isAr ? 'اختيار' : 'Choisir'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateQuickSample}
              disabled={creatingSample || !quickSampleData.modele || !quickSampleData.client}
              className="w-full py-5 bg-fuchsia-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-fuchsia-500 shadow-xl shadow-fuchsia-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {creatingSample ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              {isAr ? 'تأكيد وإطلاق العينة السريعة' : 'Confirmer et Lancer l\'Échantillon'}
            </button>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white/50 backdrop-blur-md p-3 rounded-[2rem] border border-white shadow-lg">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder={isAr ? 'بحث عن طلبية، زبون أو موديل...' : "Rechercher..."} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-[1.5rem] overflow-x-auto no-scrollbar">
          {['all', 'echantillon_en_cours', 'en_cours', 'terminé', 'livré'].map(key => (
            <button 
              key={key} 
              onClick={() => setFilterStatut(key as any)} 
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatut === key ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-white'}`}
            >
              {key === 'all' ? t('all', lang) : (T[key as keyof typeof T] ? t(key as any, lang) : key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-indigo-50/50 rounded-2xl border border-indigo-100 ml-auto">
          {['all', 'interne', 'sous-traitance'].map(k => (
            <button
              key={k}
              onClick={() => setFilterType(k as any)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === k ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:bg-white'}`}
            >
              {k === 'all' ? t('all', lang) : (T[k as keyof typeof T] ? t(k as any, lang) : k)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="w-10 px-4 py-4" />
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'المرجع' : 'Réf'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'الزبون / الموديل / الثوب' : 'Client / Modèle / Tissu'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{isAr ? 'الكمية / القيمة' : 'Qté / Valeur'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAr ? 'تتبع الإنتاج' : 'Suivi Production'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{isAr ? 'التسليم' : 'Livraison'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{isAr ? 'الحالة' : 'Statut'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => {
                const isExpanded = expandedId === c.id;
                const ds = getDynamicStatus(c);
                return (
                  <React.Fragment key={c.id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className={`group hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-50 ${isExpanded ? 'bg-indigo-50/20' : ''}`}
                    >
                      <td className="px-4 py-6 text-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-400'}`}>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{c.reference}</span>
                          <div className="flex items-center gap-2">
                             <ShoppingCart className="w-3.5 h-3.5 text-slate-300" />
                             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{c.referenceClient || 'SANS REF'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 leading-none mb-1.5">{c.client}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{c.modele}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{c.tissu || 'N/A'}</span>
                          </div>
                          {(() => {
                            const lastRefus = [...(c.suivi || [])].reverse().find(s => s.note?.startsWith('REFUS:'))?.note?.replace('REFUS: ', '').replace('REFUS:', '');
                            const note = (c as any).rejectionNote || lastRefus;
                            if (!note) return null;
                            return (
                              <div className={`mt-2 p-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-pulse ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                                <AlertTriangle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                                <p className="text-[9px] font-black text-rose-600 uppercase leading-tight">
                                  {isAr ? 'مرفوض: ' : 'Refusé: '} {note}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-sm font-black text-slate-800 leading-none">
                            {c.quantite} <span className="text-[10px] text-slate-400 uppercase tracking-widest">PCS</span>
                          </p>
                          <p className="text-[10px] font-black text-emerald-500 mt-1 uppercase">{(c.quantite * (c.prix || 0)).toLocaleString()} MAD</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col max-w-[140px]">
                           <div className="flex items-center justify-between mb-1.5">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               {isAr ? 'المرحلة' : 'Phase'}: {c.phase ? (T[`phase_${c.phase}` as TKey] ? t(`phase_${c.phase}` as TKey, lang) : (PHASE_LABELS[c.phase as Phase] || c.phase)) : (isAr ? 'في الانتظار' : 'Attente')}
                             </span>
                             <span className="text-[10px] font-black text-slate-800">{getProgress(c)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                               style={{ width: `${getProgress(c)}%` }} 
                             />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Livraison</span>
                          <span className="text-[10px] font-black text-slate-700 whitespace-nowrap">{fmtDate(c.dateLivraisonPrevue)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white shadow-sm ${ds.color}`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${ds.dot}`} />
                             {ds.label}
                           </span>
                           {(() => {
                             const partnerId = c.partenaireId || c.externalTasks?.[0]?.partenaireId;
                             if (!partnerId) return null;
                             const partner = users.find(u => u.id === partnerId || u.employeId === partnerId);
                             return (
                               <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm">
                                 {partner?.nom || partnerId}
                               </span>
                             );
                           })()}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Annulation demandée — raison + confirm or reject */}
                          {(c.statut as any) === 'annulation_demandee' && (
                            <div className="flex flex-col items-end gap-2">
                              {(c as any).annulationRaison && (
                                <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 max-w-[260px]">
                                  <span className="text-orange-400 text-sm shrink-0">💬</span>
                                  <p className="text-[10px] text-orange-700 font-bold leading-relaxed text-left">
                                    "{(c as any).annulationRaison}"
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const updated = { ...c, statut: 'annulé' as any };
                                    await saveRecord('commandes', updated);
                                    setCommandes(prev => prev.map(x => x.id === c.id ? updated : x));
                                    notifyClientWhatsApp(c, `Bonjour ${c.client}, votre demande d'annulation pour la commande ${c.reference} a été confirmée. Merci de nous contacter pour plus d'informations. — BEYA CREATIVE`);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                                >✓ Confirmer</button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const updated = { ...c, statut: 'en_cours' as any };
                                    await saveRecord('commandes', updated);
                                    setCommandes(prev => prev.map(x => x.id === c.id ? updated : x));
                                    notifyClientWhatsApp(c, `Bonjour ${c.client}, votre demande d'annulation pour la commande ${c.reference} a été refusée. Votre production continue normalement. Contactez-nous si vous avez des questions. — BEYA CREATIVE`);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
                                >✕ Rejeter</button>
                              </div>
                            </div>
                          )}

                          {/* Phase Dropdown for Echantillons */}
                          {(c.statut === 'echantillon_en_cours' || c.statut === 'echantillon_valide') && (
                            <select
                               onClick={(e) => e.stopPropagation()}
                               onChange={async (e) => {
                                  const newPhase = e.target.value as any;
                                  const updated = { ...c, phase: newPhase };
                                  await saveRecord('commandes', updated);
                                  setCommandes(prev => prev.map(x => x.id === c.id ? updated : x));
                                  if (newPhase === 'livré') {
                                    notifyClientWhatsApp(c, `Bonjour ${c.client} 👋\n\nVotre échantillon *${c.reference}* est prêt et a été livré ! 🚚\n\nMerci de vous connecter sur le portail client pour confirmer sa réception et valider la qualité afin de lancer la production.\n\n— BEYA CREATIVE`);
                                  }
                               }}
                               value={c.phase}
                               className="h-9 px-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer max-w-[100px]"
                            >
                               {PHASE_ORDER.map(p => (
                                  <option key={p} value={p}>{isAr ? phaseAr[p] : PHASE_LABELS[p]}</option>
                               ))}
                            </select>
                          )}
                          {c.statut !== 'echantillon_en_cours' && c.statut !== 'echantillon_valide' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/commandes/manage?edit=${c.id}`); }}
                              title={t('master_setup' as any, lang)}
                              className="w-9 h-9 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center hover:bg-fuchsia-600 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                          {(() => {
                            const isEchantillon = c.statut === 'echantillon_en_cours' || c.statut === 'echantillon_valide';
                            if (isEchantillon) return null; // Echantillons do not enter production

                            const isST = !!(c.partenaireId || (c.externalTasks && c.externalTasks.length > 0));
                            if (isST) return null;

                            const isPlanned = ordres.some(o => o.commandeId === c.id);
                            
                            if (isPlanned) {
                              return (
                                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200" title={isAr ? 'تمت البرمجة' : 'Déjà Planifié'}>
                                  <Check className="w-5 h-5 stroke-[3]" />
                                </div>
                              );
                            }

                            return (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSendToCoupe(c); }}
                                title={isAr ? 'إرسال للفصالة' : 'Envoyer à la coupe'}
                                className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-90"
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            );
                          })()}
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/commandes/manage?edit=${c.id}`); }}
                            className="w-9 h-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const si = getDynamicStatus(c);
                              const msg = `Bonjour ${c.client} 👋\n\nMise à jour de votre commande *${c.reference}* :\n\n📌 Statut : *${si.label}*\n📅 Livraison prévue : *${c.dateLivraisonPrevue}*\n\nMerci de votre confiance 🙏\n— BEYA CREATIVE`;
                              notifyClientWhatsApp(c, msg);
                            }}
                            title="Notifier le client par WhatsApp"
                            className="w-9 h-9 text-emerald-500 hover:text-white hover:bg-emerald-500 bg-emerald-50 rounded-xl flex items-center justify-center transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(c); }}
                            className="w-9 h-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={5} className="px-10 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                             <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dates & Délais</h4>
                               <div className="space-y-3">
                                 <div className="flex justify-between"><span className="text-xs text-slate-400">Emission:</span><span className="text-xs font-bold">{fmtDate(c.dateCommande)}</span></div>
                                 <div className="flex justify-between"><span className="text-xs text-slate-400">Livraison:</span><span className="text-xs font-bold text-indigo-600">{fmtDate(c.dateLivraisonPrevue)}</span></div>
                               </div>
                             </div>
                             <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm col-span-2">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tâches Externes</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {(c.externalTasks || []).map(t => (
                                   <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                          {t.type === 'traz' ? '🧵' : t.type === 'print' ? '🎨' : '🪡'}
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black uppercase text-slate-800">{t.type}</p>
                                          <p className="text-[9px] font-bold text-slate-400">{empName(t.partenaireId)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         {(t.partnerResultFiles || []).map((file, fIdx) => (
                                            <button 
                                              key={fIdx} 
                                              onClick={(e) => { e.stopPropagation(); downloadFile(file, `Resultat_${fIdx+1}_${c.reference}`); }}
                                              className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 flex items-center justify-center"
                                              title={`Télécharger Résultat ${fIdx+1}`}
                                            >
                                               <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                         ))}
                                         <span className="text-[9px] font-black text-indigo-500">{t.avance || 0} DH</span>
                                      </div>
                                   </div>
                                 ))}
                                 {(c.externalTasks || []).length === 0 && <p className="text-[10px] text-slate-400 italic">Aucune tâche externe...</p>}
                               </div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="p-8 border-t border-slate-50 flex justify-center bg-slate-50/30">
            <button 
              onClick={() => loadCommands(page + 1)}
              disabled={loading}
              className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (isAr ? 'عرض المزيد من الطلبيات' : 'Afficher plus de commandes')}
            </button>
          </div>
        )}
      </div>
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/10 border-2 border-rose-100/50">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">
              {isAr ? 'حذف هذه الطلبية؟' : 'Supprimer cette commande ?'}
            </h3>
            <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
              {isAr 
                ? `هل أنت متأكد من رغبتك في حذف الطلبية ${deleteConfirm.reference}؟ هذا الإجراء نهائي.` 
                : `Voulez-vous vraiment supprimer la commande ${deleteConfirm.reference} ? Cette action est irréversible.`}
            </p>
            <div className={`flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="flex-1 h-14 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 h-14 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all"
              >
                {isAr ? 'تأكيد الحذف' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10 border-2 border-emerald-100/50">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                {isAr ? 'تم بنجاح!' : 'Félicitations !'}
              </h3>
              <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed uppercase tracking-widest">
                {showSuccess}
              </p>
              <button 
                onClick={() => setShowSuccess(null)}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
              >
                {isAr ? 'حسناً' : 'Continuer'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
