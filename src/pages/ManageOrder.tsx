import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, X, 
  Package, Receipt, Layers, 
  Image as ImageIcon, FileText, CheckCircle2, AlertTriangle,
  Scissors, ShoppingCart, Ruler, Eye, Download,
  Binary, Users, Trash2, Truck, Calendar, CloudOff, Printer, Camera,
  Clock, Zap, CheckCircle2 as CheckIcon
} from 'lucide-react';
import { 
  loadData, saveRecord, genId, Commande, FicheTechnique, User, Employe, Stock, StockTissu 
} from '../types';
import { useLang } from '../contexts/LangContext';
import { t } from '../i18n';

export default function ManageOrder() {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isST = searchParams.get('st') === 'true';
  const isEchantillon = searchParams.get('echantillon') === 'true';

  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [tissus, setTissus] = useState<StockTissu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStockList, setShowStockList] = useState(false);
  const [zoomMedia, setZoomMedia] = useState<string | null>(null);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [customSizeName, setCustomSizeName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const [form, setForm] = useState<Partial<Commande>>({
    reference: '',
    referenceClient: '',
    client: '',
    modele: '',
    typeModele: '',
    tissu: '',
    quantite: 0,
    quantiteLivre: 0,
    phase: 'coupe',
    prix: 0,
    avance: 0,
    rebut: 0,
    statut: 'en_cours',
    tissuSourcing: 'maison',
    tissuPrix: 0,
    coutMainOeuvre: 0,
    tissuConsommation: 0,
    dateCommande: new Date().toISOString().split('T')[0],
    dateLivraisonPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    externalTasks: [],
    couleurs: [],
    tailles: {},
    tissus: [{ id: genId(), type: '', couleur: '', conso: 0, prix: 0, sourcing: 'maison' }],
    modelePhoto: '',
    tissuPhoto: '',
    preuveValidation: '',
    typeDossier: (isST ? 'service' : 'production') as any
  });

  const selectedFiche = fiches.find(f => 
    f.modele.toLowerCase().trim() === (form.modele || '').toLowerCase().trim()
  );

  const downloadFile = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    async function loadAll() {
      try {
        const [cmds, fch, usr, emp, stk, tss] = await Promise.all([
          loadData<Commande>('commandes'),
          loadData<FicheTechnique>('fiches'),
          loadData<User>('users'),
          loadData<Employe>('employes'),
          loadData<Stock>('stocks'),
          loadData<StockTissu>('tissus')
        ]);
        
        setFiches(fch || []);
        setUsers(usr || []);
        setEmployes(emp || []);
        setStocks(stk || []);
        setTissus(tss || []);

        if (editId) {
          const existing = (cmds || []).find(c => c.id === editId);
          if (existing) {
            setForm({
              ...existing,
              couleurs: existing.couleurs || [],
              tailles: existing.tailles || {},
              externalTasks: existing.externalTasks || [],
              tissus: (existing as any).tissus || [{ id: genId(), type: existing.tissu?.split(' - ')[1] || '', couleur: existing.tissu?.split(' - ')[0] || '', conso: (existing as any).tissuConsommation || 0, prix: existing.tissuPrix || 0, sourcing: existing.tissuSourcing || 'maison' }]
            });
          }
        } else {
          const year = new Date().getFullYear().toString().slice(-2);
          const prefix = 'CMD';
          const lastNum = (cmds || []).length > 0 
            ? Math.max(...(cmds || []).map(c => {
                const parts = c.reference.split('-');
                const n = parseInt(parts[parts.length - 1]);
                return isNaN(n) ? 0 : n;
              })) + 1 
            : 1;
          const ref = `${prefix}-${year}-${String(lastNum).padStart(3, '0')}`;
          setForm(prev => ({ 
            ...prev, 
            reference: ref,
            statut: isEchantillon ? 'echantillon_en_cours' : 'en_cours',
            quantite: isEchantillon ? 1 : 0,
            externalTasks: isST ? [{ id: genId(), type: 'confection', partenaireId: '', details: '', status: 'en_attente', avance: 0, quantite: isEchantillon ? 1 : 0 }] : []
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [editId, isST]);

  const handleModeleChange = (modeleName: string) => {
    const fiche = fiches.find(f => f.modele === modeleName);
    if (fiche) {
      const suggestedTissu = (fiche as any).tissu || '';
      let autoPrice = 0;
      if (suggestedTissu) {
        const tMatch = tissus.find(t => 
          `${t.couleur} - ${t.type}`.toLowerCase() === suggestedTissu.toLowerCase() ||
          t.type.toLowerCase() === suggestedTissu.toLowerCase()
        );
        if (tMatch) autoPrice = tMatch.prixMetre;
      }
      setForm(prev => ({
        ...prev,
        modele: modeleName,
        typeModele: fiche.type || '',
        tissus: [{ 
          id: genId(), 
          type: suggestedTissu.split(' - ')[1] || suggestedTissu, 
          couleur: suggestedTissu.split(' - ')[0] || '', 
          conso: (fiche as any).tissuConsommation || 0, 
          prix: autoPrice, 
          sourcing: prev.tissuSourcing || 'maison' 
        }],
        modelePhoto: fiche.photo || prev.modelePhoto,
        preuveValidation: prev.preuveValidation || '',
        tailles: fiche.tailles.reduce((acc, t) => ({ ...acc, [t]: prev.tailles?.[t] || 0 }), {})
      }));
    } else {
      setForm(prev => ({ ...prev, modele: modeleName }));
    }
  };

  const addFabricRow = () => {
    // Find consumption from the current selected model to pre-fill the new row
    const fiche = fiches.find(f => f.modele === form.modele);
    const defaultConso = fiche?.tissuConsommation || 0;
    
    const newRow = { id: genId(), type: '', couleur: '', conso: defaultConso, prix: 0, sourcing: 'maison' };
    setForm(prev => ({ ...prev, tissus: [...(prev.tissus || []), newRow] }));
  };

  const removeFabricRow = (id: string) => {
    if ((form.tissus || []).length <= 1) return;
    setForm(prev => ({ ...prev, tissus: prev.tissus?.filter((t: any) => t.id !== id) }));
  };

  const updateFabricRow = (id: string, updates: any) => {
    const updated = (form.tissus || []).map((t: any) => t.id === id ? { ...t, ...updates } : t);
    setForm(prev => ({ ...prev, tissus: updated }));
  };

  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const selectTissuForRR = (t: StockTissu) => {
    if (!activeRowId) return;
    updateFabricRow(activeRowId, { 
      type: t.type, 
      couleur: t.couleur, 
      prix: t.prixMetre 
    });
    setShowStockList(false);
    setActiveRowId(null);
  };

  const updateTailleQty = (taille: string, qty: number) => {
    const updated = { ...form.tailles, [taille]: qty };
    const total = Object.values(updated).reduce((a, b) => a + (b as number), 0);
    setForm({ ...form, tailles: updated, quantite: total });
  };

  const addExternalTask = () => {
    const newTask: any = { id: genId(), type: 'confection', partenaireId: '', details: '', status: 'en_attente', avance: 0, prixUnitaire: 0, photo: '', quantite: form.quantite || 0 };
    setForm({ ...form, externalTasks: [...(form.externalTasks || []), newTask] });
  };

  const handleTaskPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 500) {
        setSuccessMsg(isAr ? 'الملف كبير جداً (الأقصى 500kb)' : 'Fichier trop lourd (Max 500kb)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        updateExternalTask(taskId, { photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTaskAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        setSuccessMsg(isAr ? 'الملف كبير جداً (الأقصى 2MB)' : 'Fichier trop lourd (Max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const tasks = [...(form.externalTasks || [])];
        const idx = tasks.findIndex(t => t.id === taskId);
        if (idx !== -1) {
          const current = tasks[idx].attachments || [];
          tasks[idx] = { ...tasks[idx], attachments: [...current, reader.result as string] };
          setForm({ ...form, externalTasks: tasks });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeExternalTask = (id: string) => {
    setForm({ ...form, externalTasks: (form.externalTasks || []).filter(t => t.id !== id) });
  };

  const updateExternalTask = (id: string, updates: any) => {
    const updated = (form.externalTasks || []).map(t => t.id === id ? { ...t, ...updates } : t);
    setForm({ ...form, externalTasks: updated });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'modelePhoto' | 'preuveValidation') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 500) { // Alert if > 500KB
        setSuccessMsg(isAr ? 'الصورة كبيرة جداً، يرجى اختيار صورة أصغر من 500KB' : 'Image trop grande, veuillez choisir une image < 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, [field]: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const save = async () => {
    if (!form.reference || !form.client) {
      setSuccessMsg(isAr ? 'المرجع والزبون مطلوبان' : 'Référence et Client sont obligatoires');
      return;
    }
    
    setLoading(true);
    try {
      // Summarize fabric for the main 'tissu' field
      const fabricSummary = (form.tissus || []).map(t => `${t.couleur} ${t.type}`).join(', ');
      
      const record = {
        id: editId || genId(),
        reference: form.reference,
        client: form.client,
        modele: form.modele,
        quantite: form.quantite || 0,
        prix: form.prix || 0,
        statut: form.statut || 'en_cours',
        dateCommande: form.dateCommande || new Date().toISOString().split('T')[0],
        dateLivraisonPrevue: form.dateLivraisonPrevue || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        phase: form.phase || 'coupe',
        tissu: fabricSummary,
        tissus: form.tissus, // Save full array if possible
        externalTasks: form.externalTasks || [],
        partenaireId: form.externalTasks && form.externalTasks.length > 0 ? form.externalTasks[0].partenaireId : null,
        typeDossier: form.typeDossier || 'production'
      };
      
      await saveRecord('commandes', record);
      navigate('/commandes');
    } catch (error: any) {
      console.error(error);
      setSuccessMsg(isAr ? `خطأ في الاتصال بالسيرفر: ${error.message}` : `Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const qtyTotal = form.quantite || 0;
  const prixVente = form.prix || 0;
  const pMO = form.coutMainOeuvre || 0;

  const totalVente = qtyTotal * prixVente;
  
  // Calculate total fabric cost from all rows
  const coutTissuTotal = (form.tissus || []).reduce((acc, t) => {
    const rowPrice = t.sourcing === 'client' ? 0 : t.prix;
    return acc + (qtyTotal * (t.conso || 0) * (rowPrice || 0));
  }, 0);

  const coutMOTotal = qtyTotal * pMO;
  const margeBrute = totalVente - (coutTissuTotal + coutMOTotal);

  const filteredTissus = tissus.filter(t => {
    if (!activeRowId) return true; // Show all if no row active
    const activeRow = (form.tissus || []).find(r => r.id === activeRowId);
    const search = activeRow ? `${activeRow.couleur} ${activeRow.type}`.toLowerCase().trim() : '';
    if (!search) return true;
    return t.couleur.toLowerCase().includes(search) || t.type.toLowerCase().includes(search);
  });

  if (loading && !editId) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Establishing Connection...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/commandes')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft className="w-6 h-6 text-slate-400" /></button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Binary className="w-5 h-5" /></div>
              <div><h1 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">{t('master_setup', lang)}</h1><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 flex items-center gap-1"><CloudOff className="w-3 h-3" /> {t('connection_priority', lang)}</p></div>
            </div>
          </div>
          <button onClick={save} disabled={loading} className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest ${loading ? 'opacity-50' : ''}`}>
            <Save className="w-4 h-4" /> {loading ? (isAr ? 'جاري الحفظ...' : 'Sauvegarde...') : (isAr ? 'تأكيد وحفظ' : 'Enregistrer')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 flex items-center justify-center gap-4 mb-8">
           <button 
             onClick={() => setForm({ ...form, typeDossier: 'production' })}
             className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${(form.typeDossier as any) === 'production' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <Package className="w-5 h-5" />
             {isAr ? 'إنتاج كامل' : 'Production Complète'}
           </button>
           <button 
             onClick={() => setForm({ ...form, typeDossier: 'service' })}
             className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${(form.typeDossier as any) === 'service' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <Truck className="w-5 h-5" />
             {isAr ? 'خدمة / مهمة (باترون...)' : 'Service / Mission Externe'}
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
               <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
                 <AlertTriangle className="w-4 h-4 text-amber-600" />
                 <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">
                   {(form.typeDossier as any) === 'production' 
                     ? (isAr ? 'وضع الإنتاج: يتضمن تتبع الثوب والمقاسات' : 'MODE PRODUCTION: Suivi tissu et tailles inclus')
                     : (isAr ? 'وضع الخدمة: موجه فقط للمهام الخارجية' : 'MODE SERVICE: Focus sur les tâches externes uniquement')}
                 </p>
               </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">
                  {t('ref_factory', lang)}
                </label>
                <input 
                  value={form.reference} 
                  onChange={e => setForm({ ...form, reference: e.target.value })}
                  className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <div className="flex flex-col"><label className="text-[9px] font-black text-indigo-400 uppercase mb-1 ml-1">{t('date_livraison_prevue_label', lang)}</label><div className="relative"><input type="date" value={form.dateLivraisonPrevue} onChange={e => setForm({ ...form, dateLivraisonPrevue: e.target.value })} className="w-full px-6 py-4 bg-indigo-50/30 border-2 border-indigo-50 rounded-2xl text-sm font-black outline-none text-indigo-700" /><Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" /></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black outline-none focus:border-indigo-500"><option value="">— {isAr ? 'الزبون' : 'Client'} —</option>{users.filter(u => u.role === 'client').map(u => <option key={u.id} value={u.nom}>{u.nom}</option>)}</select>
              <select value={form.modele} onChange={e => handleModeleChange(e.target.value)} className="px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-black outline-none focus:border-indigo-500"><option value="">— {isAr ? 'الموديل' : 'Modèle'} —</option>{fiches.map(f => <option key={f.id} value={f.modele}>{f.modele}</option>)}</select>
            </div>
          </div>

          { (form.typeDossier as any) === 'production' && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-top-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><ShoppingCart className="w-4 h-4 text-amber-600" /> {t('sourcing_tissu_multiple', lang)}</h2>
                  <button onClick={addFabricRow} className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-100 transition-colors shadow-sm"><Plus className="w-5 h-5" /></button>
               </div>

               <div className="space-y-10">
                  {(form.tissus || []).map((row, idx) => (
                    <div key={row.id} className="relative p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-6 animate-in slide-in-from-right-4 duration-300">
                      {idx > 0 && <button onClick={() => removeFabricRow(row.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                            <button onClick={() => updateFabricRow(row.id, { sourcing: 'maison' })} className={`flex-1 py-3 rounded-[1.2rem] text-[9px] font-black uppercase transition-all ${row.sourcing === 'maison' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>{t('beya_stock', lang)}</button>
                            <button onClick={() => updateFabricRow(row.id, { sourcing: 'client', prix: 0 })} className={`flex-1 py-3 rounded-[1.2rem] text-[9px] font-black uppercase transition-all ${row.sourcing === 'client' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400'}`}>{t('client_fourni', lang)}</button>
                          </div>
                          <div className="relative">
                            <input 
                              value={`${row.couleur} ${row.type}`.trim()} 
                              onClick={() => { setActiveRowId(row.id); setShowStockList(true); }} 
                              onChange={e => {
                                const [color, ...typeParts] = e.target.value.split(' ');
                                updateFabricRow(row.id, { couleur: color || '', type: typeParts.join(' ') || '' });
                                setActiveRowId(row.id);
                                setShowStockList(true);
                              }} 
                              className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-amber-500 transition-all shadow-sm cursor-pointer" 
                              placeholder={t('choisir_depuis_stock', lang)} 
                            />
                            {showStockList && activeRowId === row.id && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-20 max-h-64 overflow-y-auto">
                                {filteredTissus.map(t => (
                                  <button key={t.id} onClick={() => selectTissuForRR(t)} className="w-full px-6 py-4 text-left hover:bg-indigo-50 flex items-center justify-between border-b border-slate-50 transition-colors">
                                    <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full bg-indigo-500`} /><span className="text-sm font-black">{t.couleur} - {t.type}</span></div>
                                    <span className="text-[10px] font-bold text-amber-600">{t.prixMetre} MAD/m</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[9px] font-black text-indigo-500 uppercase mb-2 ml-1 flex items-center gap-1.5"><Ruler className="w-3 h-3" /> {t('conso_m_pc_label', lang)}</label>
                            <input type="number" step="0.01" value={row.conso || 0} onChange={e => updateFabricRow(row.id, { conso: parseFloat(e.target.value) || 0 })} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black outline-none focus:border-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-amber-600 uppercase mb-2 ml-1">{t('prix_achat_dh_m', lang)}</label>
                            <input type="number" disabled={row.sourcing === 'client'} value={row.sourcing === 'client' ? 0 : (row.prix || 0)} onChange={e => updateFabricRow(row.id, { prix: parseFloat(e.target.value) || 0 })} className={`w-full px-6 py-4 border-2 rounded-2xl text-xl font-black outline-none ${row.sourcing === 'client' ? 'bg-slate-100 border-slate-100 text-slate-400' : 'bg-white border-slate-100 text-amber-700'}`} />
                          </div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">{t('mo_pc_dh', lang)}</label>
                  <input type="number" value={form.coutMainOeuvre || 0} onChange={e => setForm({ ...form, coutMainOeuvre: parseFloat(e.target.value) || 0 })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black outline-none text-slate-700" />
               </div>
            </div>
          )}

          { (form.typeDossier as any) === 'production' && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-500" /> {t('quantites_par_taille', lang)}</h3>
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setShowAddSizeModal(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                   >
                     <Plus className="w-3.5 h-3.5" /> {isAr ? 'مقاس مخصص' : 'Taille Perso'}
                   </button>
                   {Object.keys(form.tailles || {}).length === 0 && (
                     <button 
                       onClick={() => setForm({ ...form, tailles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } })}
                       className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                     >
                       {isAr ? 'إضافة مقاسات قياسية' : 'Ajouter Tailles Standard'}
                     </button>
                   )}
                 </div>
              </div>
              
              {Object.keys(form.tailles || {}).length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {Object.keys(form.tailles || {}).map(t => (
                    <div key={t} className="flex-1 min-w-[100px] p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex flex-col items-center gap-2 hover:border-indigo-200 transition-all group relative">
                      <button 
                        onClick={() => {
                          const updated = { ...form.tailles };
                          delete updated[t];
                          setForm({ ...form, tailles: updated });
                        }}
                        className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500">{t}</span>
                      <input 
                        type="number" 
                        value={form.tailles![t] || 0} 
                        onChange={e => updateTailleQty(t, parseInt(e.target.value) || 0)} 
                        className="w-full text-center bg-transparent text-2xl font-black text-slate-800 outline-none focus:text-indigo-600" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300">
                   <Ruler className="w-12 h-12 mb-4 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'لا توجد مقاسات محددة' : 'Aucune taille définie'}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><Truck className="w-4 h-4 text-indigo-600" /> {t('sous_traitance_faconniers', lang)}</h2>
               <button onClick={addExternalTask} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-colors uppercase tracking-widest shadow-sm"><Plus className="w-3.5 h-3.5" /> {t('ajouter_une_tache', lang)}</button>
            </div>
            <div className="space-y-6">
              {(form.externalTasks || []).map((task) => {
                const totalTask = (task.prixUnitaire || 0) * (task.quantite !== undefined ? task.quantite : (form.quantite || 0));
                return (
                  <div key={task.id} className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative group animate-in slide-in-from-bottom-2 duration-300">
                    <button onClick={() => removeExternalTask(task.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> {isAr ? 'صورة العمل (طرز/طبع)' : 'PHOTO DU TRAVAIL'}</label>
                        <div className="aspect-square bg-white rounded-3xl overflow-hidden border-2 border-slate-100 flex items-center justify-center relative group/img shadow-sm">
                           {task.photo ? (
                             <>
                               <img src={task.photo} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                               <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button onClick={() => setZoomMedia(task.photo!)} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40 transition-all"><Eye className="w-4 h-4" /></button>
                                  <button onClick={() => updateExternalTask(task.id, { photo: '' })} className="p-2 bg-rose-500/80 backdrop-blur-md text-white rounded-xl hover:bg-rose-600 transition-all"><X className="w-4 h-4" /></button>
                               </div>
                             </>
                           ) : (
                             <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-indigo-50 transition-colors">
                                <Plus className="w-8 h-8 text-slate-200" />
                                <span className="text-[8px] font-black text-slate-300 uppercase mt-2">{isAr ? 'رفع الصورة' : 'Upload Image'}</span>
                                <input type="file" className="hidden" onChange={e => handleTaskPhotoUpload(e, task.id)} />
                             </label>
                           )}
                        </div>

                        <div className="mt-6 space-y-3">
                           <label className="block text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> {isAr ? 'ملفات إضافية' : 'ATTACHEMENTS EXTRA'}</label>
                           <div className="grid grid-cols-3 gap-2">
                              {(task.attachments || []).map((file, idx) => (
                                 <div key={idx} className="aspect-square bg-white rounded-xl relative group overflow-hidden border border-slate-200 shadow-sm">
                                    <img src={file} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                                       <button onClick={() => setZoomMedia(file)} className="p-1 bg-white/20 rounded-md text-white"><Eye className="w-3 h-3" /></button>
                                       <button 
                                          onClick={() => {
                                            const updated = (task.attachments || []).filter((_, i) => i !== idx);
                                            updateExternalTask(task.id, { attachments: updated });
                                          }}
                                          className="p-1 bg-rose-500/80 rounded-md text-white"
                                       >
                                          <X className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer">
                                 <Plus className="w-5 h-5" />
                                 <input type="file" className="hidden" onChange={e => handleTaskAttachmentUpload(e, task.id)} />
                              </label>
                           </div>
                        </div>
                      </div>

                      <div className="md:col-span-9 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">{t('type_de_travail', lang)}</label>
                            <select value={task.type} onChange={e => updateExternalTask(task.id, { type: e.target.value })} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 shadow-sm transition-all">
                              <option value="confection">{isAr ? 'خياطة' : 'Confection'}</option>
                              <option value="broderie">{isAr ? 'طرز' : 'Broderie'}</option>
                              <option value="impression">{isAr ? 'طباعة' : 'Impression'}</option>
                              <option value="lavage">{isAr ? 'غسل' : 'Lavage'}</option>
                              <option value="patronage">{isAr ? 'باترون' : 'Patronage'}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">{t('partenaire', lang)}</label>
                            <select value={task.partenaireId} onChange={e => updateExternalTask(task.id, { partenaireId: e.target.value })} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 shadow-sm transition-all">
                              <option value="">— {t('partenaire', lang)} —</option>
                              {users.filter(u => u.role === 'partenaire').map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-indigo-500 uppercase mb-2 ml-1">{isAr ? 'العدد (الكمية)' : 'QUANTITÉ'}</label>
                            <input type="number" value={task.quantite !== undefined ? task.quantite : (form.quantite || 0)} onChange={e => updateExternalTask(task.id, { quantite: parseInt(e.target.value) || 0 })} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-black outline-none focus:border-indigo-500 shadow-sm" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-indigo-500 uppercase mb-2 ml-1">{isAr ? 'الثمن للقطعة' : 'PRIX UNITAIRE (DH)'}</label>
                            <input type="number" step="0.01" value={task.prixUnitaire || 0} onChange={e => updateExternalTask(task.id, { prixUnitaire: parseFloat(e.target.value) || 0 })} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-black outline-none focus:border-indigo-500 shadow-sm" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] font-black uppercase text-indigo-200 block mb-1">Total Tâche</span>
                                <p className="text-3xl font-black">{totalTask.toLocaleString()} <span className="text-sm">DH</span></p>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-black uppercase text-indigo-200 block mb-1">{isAr ? 'الباقي' : 'RESTE'}</span>
                                <p className="text-xl font-bold text-white/80">{(totalTask - (task.avance || 0)).toLocaleString()} <span className="text-xs">DH</span></p>
                              </div>
                           </div>
                           
                           <div className="flex flex-col justify-center gap-4">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">{t('avance_dh_label', lang)}</label>
                                  <input type="number" value={task.avance || 0} onChange={e => updateExternalTask(task.id, { avance: parseFloat(e.target.value) || 0 })} className="w-full px-6 py-3 bg-white border-2 border-slate-100 rounded-xl text-xs font-black outline-none focus:border-emerald-500 transition-all" />
                                </div>
                                <div className="flex-1">
                                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">{isAr ? 'حالة العمل' : 'STATUT'}</label>
                                   <div className="flex bg-white p-1.5 rounded-2xl shadow-inner border border-slate-100 h-14 gap-2">
                                      <button 
                                        onClick={() => updateExternalTask(task.id, { status: 'en_attente' })} 
                                        className={`flex-1 rounded-[0.9rem] flex items-center justify-center transition-all ${task.status === 'en_attente' ? 'bg-slate-100 text-slate-600 shadow-sm' : 'text-slate-200 hover:text-slate-400'}`}
                                        title="En Attente"
                                      >
                                        <Clock className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={() => updateExternalTask(task.id, { status: 'en_cours' })} 
                                        className={`flex-1 rounded-[0.9rem] flex items-center justify-center transition-all ${task.status === 'en_cours' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-200 hover:text-amber-400'}`}
                                        title="En Cours"
                                      >
                                        <Zap className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={() => updateExternalTask(task.id, { status: 'terminé' })} 
                                        className={`flex-1 rounded-[0.9rem] flex items-center justify-center transition-all ${task.status === 'terminé' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-200 hover:text-emerald-400'}`}
                                        title="Terminé"
                                      >
                                        <CheckIcon className="w-5 h-5" />
                                      </button>
                                   </div>
                                </div>
                              </div>
                           </div>
                        </div>

                        {(task.partnerResultFiles || []).length > 0 && (
                          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between animate-in slide-in-from-top-2">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 className="w-5 h-5" /></div>
                                <div>
                                   <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">{isAr ? 'نتائج الشريك' : 'RÉSULTATS DU PARTENAIRE'}</h4>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{(task.partnerResultFiles || []).length} {isAr ? 'ملفات مستلمة' : 'fichiers reçus'}</p>
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {(task.partnerResultFiles || []).map((file, rIdx) => (
                                   <button key={rIdx} onClick={() => downloadFile(file, `Resultat_${rIdx+1}_${form.reference}`)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-slate-100 shadow-sm flex items-center gap-2 group/res">
                                      <Download className="w-3.5 h-3.5 group-hover/res:scale-110 transition-transform" />
                                      <span className="text-[8px] font-black uppercase">{isAr ? 'تحميل النتيجة' : 'Résultat'} {rIdx + 1}</span>
                                   </button>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Box 1: Photo Modèle */}
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4" /> {t('photo_modele_label', lang)}</h3>
                   {form.modelePhoto && <button onClick={() => setZoomMedia(form.modelePhoto!)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600"><Eye className="w-4 h-4" /></button>}
                </div>
                <div className="aspect-[4/3] bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 flex items-center justify-center relative">
                   {form.modelePhoto ? <img src={form.modelePhoto} className="w-full h-full object-cover" /> : <label className="cursor-pointer flex flex-col items-center"><ImageIcon className="w-10 h-10 text-slate-200" /><input type="file" className="hidden" onChange={e => handleFileUpload(e, 'modelePhoto')} /></label>}
                </div>
             </div>

             {/* Box 2: Confirmation Client (Sample Proof) */}
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {isAr ? 'تأكيد الزبون (Echantillon)' : 'CONFIRMATION CLIENT'}</h3>
                   {form.preuveValidation && <button onClick={() => setZoomMedia(form.preuveValidation!)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-amber-600"><Eye className="w-4 h-4" /></button>}
                </div>
                <div className="aspect-[4/3] bg-amber-50/30 rounded-3xl overflow-hidden border-2 border-amber-100/50 flex items-center justify-center relative">
                   {form.preuveValidation ? <img src={form.preuveValidation} className="w-full h-full object-contain p-2" /> : <label className="cursor-pointer flex flex-col items-center"><Camera className="w-10 h-10 text-amber-200" /><input type="file" className="hidden" onChange={e => handleFileUpload(e, 'preuveValidation')} /></label>}
                </div>
             </div>

             {/* Box 3: Patronage (from Master Setup) */}
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"><Scissors className="w-4 h-4" /> {isAr ? 'الباترون (Master)' : 'PATRONAGE (MASTER)'}</h3>
                   <div className="flex items-center gap-1">
                      {selectedFiche?.patronagePhoto && (
                        <>
                          <button onClick={() => downloadFile(selectedFiche.patronagePhoto!, `Patron_${selectedFiche.modele}`)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Télécharger"><Download className="w-4 h-4" /></button>
                          <button onClick={() => setZoomMedia(selectedFiche.patronagePhoto!)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600 transition-all"><Eye className="w-4 h-4" /></button>
                        </>
                      )}
                   </div>
                </div>
                <div className="aspect-[4/3] bg-indigo-50/20 rounded-3xl overflow-hidden border-2 border-indigo-100/30 flex items-center justify-center relative group">
                   {selectedFiche?.patronagePhoto ? (
                      <div className="w-full h-full flex items-center justify-center p-4">
                         {/* We use an image tag but with a fallback if it's not a valid image (e.g. PDF/DXF) */}
                         <img 
                           src={selectedFiche.patronagePhoto} 
                           className="max-w-full max-h-full object-contain" 
                           onError={(e) => {
                             // If image fails to load, replace with a file icon
                             (e.target as any).style.display = 'none';
                             (e.target as any).parentElement.innerHTML = `<div class="flex flex-col items-center text-indigo-300"><svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span class="text-[9px] font-black uppercase tracking-widest">Fichier Document</span></div>`;
                           }}
                         />
                      </div>
                   ) : (
                      <div className="flex flex-col items-center text-slate-300">
                         <FileText className="w-10 h-10 opacity-20" />
                         <span className="text-[8px] font-black uppercase mt-2">{isAr ? 'لا يوجد باترون' : 'Aucun Patron'}</span>
                      </div>
                   )}
                </div>
             </div>

             {/* Box 4: Fiche Technique (PDF/Print) */}
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-4 h-4" /> {isAr ? 'البطاقة التقنية' : 'FICHE TECHNIQUE'}</h3>
                </div>
                <div className="aspect-[4/3] bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 flex flex-col items-center justify-center relative group">
                   {selectedFiche ? (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                           <Printer className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="text-center mb-4">
                           <p className="text-[10px] font-black text-slate-800 uppercase">{selectedFiche.modele}</p>
                           <p className="text-[8px] font-bold text-slate-400">{selectedFiche.mesures?.length || 0} Mesures · {new Date(selectedFiche.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                           onClick={() => window.print()} 
                           className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                        >
                           {isAr ? 'طبع البطاقة' : 'Imprimer la Fiche'}
                        </button>
                      </>
                   ) : (
                      <div className="flex flex-col items-center text-slate-300">
                         <AlertTriangle className="w-10 h-10 opacity-20" />
                         <span className="text-[8px] font-black uppercase mt-2">{isAr ? 'اختر موديلاً' : 'Sélectionnez un modèle'}</span>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 sticky top-24">
             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
               <Receipt className="w-4 h-4 text-emerald-600" /> 
               {(form.typeDossier as any) === 'production' ? t('bilan_financier_pro', lang) : (isAr ? 'تتبع تكاليف الخدمة' : 'Suivi Coûts Service')}
             </h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 mb-1">{t('quantite_total', lang)}</label>
                 <input 
                   type="number" 
                   value={form.quantite || 0} 
                   onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                   className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black outline-none focus:border-indigo-500" 
                 />
               </div>
               
               {(form.typeDossier as any) === 'production' && (
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 mb-1">{t('prix_vente_ht_label', lang)}</label>
                   <input 
                     type="number" 
                     value={form.prix || 0} 
                     onChange={e => setForm({ ...form, prix: parseFloat(e.target.value) || 0 })} 
                     className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black outline-none focus:border-emerald-500" 
                   />
                 </div>
               )}
             </div>

             <div className="pt-6 border-t border-slate-100">
               {(form.typeDossier as any) === 'production' ? (
                 <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500">{t('ca_estime', lang)}</span>
                      <p className="text-4xl font-black">{totalVente.toLocaleString()} <span className="text-sm">DH</span></p>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>{t('cost_tissu', lang)}:</span>
                        <span className="text-rose-400">-{coutTissuTotal.toLocaleString()} DH</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>{t('cost_mo', lang)}:</span>
                        <span className="text-rose-400">-{coutMOTotal.toLocaleString()} DH</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] font-black uppercase text-emerald-500">{t('marge_brute_reelle', lang)}</span>
                        <p className="text-2xl font-black text-emerald-400">+{margeBrute.toLocaleString()} DH</p>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="p-8 bg-indigo-600 rounded-[3rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-indigo-200">{isAr ? 'إجمالي تكلفة الخدمة' : 'Coût Total Service'}</span>
                    <p className="text-4xl font-black">
                      {(form.externalTasks || []).reduce((acc, t) => acc + ((t.prixUnitaire || 0) * (t.quantite !== undefined ? t.quantite : (form.quantite || 0))), 0).toLocaleString()} 
                      <span className="text-sm"> DH</span>
                    </p>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase leading-relaxed">
                      {isAr ? 'هذا المبلغ يمثل ما ستدفعه للفصونيي' : 'Ce montant représente ce que vous payez aux façonniers.'}
                    </p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
      {zoomMedia && <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8" onClick={() => setZoomMedia(null)}><img src={zoomMedia} className="max-w-full max-h-full rounded-3xl shadow-2xl" /></div>}

      {/* Custom Size Modal */}
      {showAddSizeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Ruler className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">{isAr ? 'إضافة مقاس جديد' : 'Ajouter une Taille'}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase">{isAr ? 'مثلا: 42, XXXL, 6 ans' : 'Ex: 42, XXXL, 6 ans'}</p>
                 </div>
              </div>
              
              <input 
                autoFocus
                type="text" 
                value={customSizeName}
                onChange={e => setCustomSizeName(e.target.value)}
                placeholder={isAr ? 'اسم المقاس...' : 'Nom du مقاس...'}
                className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black outline-none focus:border-indigo-500 mb-8 shadow-inner transition-all text-slate-800"
                onKeyDown={e => {
                  if (e.key === 'Enter' && customSizeName) {
                    setForm({ ...form, tailles: { ...form.tailles, [customSizeName]: 0 } });
                    setCustomSizeName('');
                    setShowAddSizeModal(false);
                  }
                }}
              />
              
              <div className="flex gap-4">
                 <button 
                   onClick={() => { setShowAddSizeModal(false); setCustomSizeName(''); }}
                   className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                 >
                   {isAr ? 'إلغاء' : 'Annuler'}
                 </button>
                 <button 
                   onClick={() => {
                     if (customSizeName) {
                       setForm({ ...form, tailles: { ...form.tailles, [customSizeName]: 0 } });
                       setCustomSizeName('');
                       setShowAddSizeModal(false);
                     }
                   }}
                   className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all"
                 >
                   {isAr ? 'إضافة' : 'Ajouter'}
                 </button>
              </div>
           </div>
        </div>
      )}
        {successMsg && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-slate-900/90 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-2xl">
               <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                  <CheckCircle2 className="w-6 h-6 text-white" />
               </div>
               <div className={isAr ? 'text-right' : ''}>
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5">{isAr ? 'تمت العملية' : 'Succès'}</p>
                 <p className="text-sm font-black uppercase tracking-tight">{successMsg}</p>
               </div>
            </div>
          </div>
        )}
    </div>
  </div>
);
}
