import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2, Camera, Download, FileText, CheckCircle, Clock, User as UserIcon, Maximize2, X, MessageCircle } from 'lucide-react';
import { FicheTechnique, loadData, loadCompanyProfile, genId, Facture, saveRecord, loadLeads } from '../types';
import type { User, Lead } from '../types';
import { useLang } from '../contexts/LangContext';
import { PageLoader } from '../components/PageLoader';
import { t } from '../i18n';
import { compressImage } from '../utils/image';
import { printElement } from '../utils/pdf';

interface ModelItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  matierePrice: number;
  laborPrice: number;
  fabricType: string;
}

interface DevisBuilderProps {
  embedded?: boolean;
  onBack?: () => void;
}

export default function DevisBuilder({ embedded = false, onBack }: DevisBuilderProps = {}) {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();
  const company = loadCompanyProfile();

  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const visibleLeads = embedded ? leads.filter(l => l.commercialUnlocked) : leads;
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);

  const [selectedClient, setSelectedClient] = useState<{id: string, nom: string, telephone: string} | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  const [models, setModels] = useState<ModelItem[]>([]);
  
  const currentPhone = selectedClient?.telephone || newClientPhone;
  const currentName = selectedClient?.nom || newClientName;
  const clientLeads = visibleLeads.filter(l => 
    (currentPhone && l.phone && (l.phone.includes(currentPhone) || currentPhone.includes(l.phone))) ||
    (currentName && l.name && l.name.toLowerCase() === currentName.toLowerCase())
  );

  const importLeadAsModel = (lead: Lead) => {
    const newModel: ModelItem = {
      id: genId(),
      name: lead.type || '',
      image: lead.photo || (lead.photos && lead.photos.length > 0 ? lead.photos[0] : ''),
      quantity: lead.quantity || 1,
      matierePrice: 0,
      laborPrice: 0,
      fabricType: ''
    };
    setModels(prev => [...prev, newModel]);
  };
  
  const [delai, setDelai] = useState('15');
  const [acomptePercent, setAcomptePercent] = useState(50);
  const [devisNum, setDevisNum] = useState('');

  useEffect(() => {
    Promise.all([
      loadData<User>('utilisateurs'),
      loadData<FicheTechnique>('fiches_techniques'),
      loadData<Facture>('factures'),
      loadLeads()
    ]).then(([users, fchs, facs, dmds]) => {
      setClients(users.filter(u => u.role === 'client'));
      setLeads(dmds);
      setFiches(fchs);
      setFactures(facs);
      
      const year = new Date().getFullYear();
      const prefix = `DEV-${year}-`;
      const existingNums = facs
        .filter(f => f.numero.startsWith(prefix))
        .map(f => parseInt(f.numero.replace(prefix, '')))
        .filter(n => !isNaN(n));
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
      setDevisNum(`${prefix}${String(nextNum).padStart(3, '0')}`);

      // 🤖 Auto-import from AI Expert (beya_ai_to_devis)
      const aiData = localStorage.getItem('beya_ai_to_devis');
      if (aiData) {
        try {
          const parsed = JSON.parse(aiData);
          // Only import if recent (within 5 minutes)
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000 && parsed.items?.length > 0) {
            const aiModels = parsed.items.map((item: any) => ({
              id: Math.random().toString(36).slice(2),
              name: item.designation || 'Désignation',
              image: '',
              quantity: 1,
              matierePrice: item.montant || 0,
              laborPrice: 0,
              fabricType: item.detail || ''
            }));
            setModels(aiModels);
            setNewClientName('AI Expert BEYA');
          }
          localStorage.removeItem('beya_ai_to_devis');
        } catch (e) { /* ignore */ }
      }

      setLoading(false);
    });
  }, []);

  const totalMatiere = models.reduce((acc, m) => acc + (m.matierePrice * m.quantity), 0);
  const totalLabor = models.reduce((acc, m) => acc + (m.laborPrice * m.quantity), 0);
  const totalGeneral = totalMatiere + totalLabor;
  const acompte = totalGeneral * (acomptePercent / 100);

  const addModel = () => {
    setModels([...models, {
      id: genId(),
      name: '',
      image: '',
      quantity: 100,
      matierePrice: 0,
      laborPrice: 0,
      fabricType: ''
    }]);
  };

  const updateModel = (id: string, updates: Partial<ModelItem>) => {
    setModels(models.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
  };

  const clientName = selectedClient ? selectedClient.nom : newClientName;
  const clientPhone = selectedClient ? selectedClient.telephone : newClientPhone;

  const handleShareWhatsApp = () => {
    if (!clientName || models.length === 0) {
      alert(isAr ? 'المرجو إضافة زبون وموديلات أولاً' : 'Veuillez ajouter un client et des modèles d\'abord.');
      return;
    }

    const greeting = isAr 
      ? `مرحباً *${clientName}*، معكم *${company.name}*. ✨\n\nإليكم تفاصيل عرض السعر الخاص بطلبكم:\n`
      : `Bonjour *${clientName}*, ici *${company.name}*. ✨\n\nVoici le devis de votre commande:\n`;

    const modelsText = models.map((m, idx) => {
      const name = m.name || (isAr ? 'موديل ' : 'Modèle ') + (idx + 1);
      const totalItem = (m.matierePrice + m.laborPrice) * m.quantity;
      const pu = (m.matierePrice + m.laborPrice);
      return `• ${name}: ${m.quantity} pcs × ${pu} MAD = *${totalItem.toLocaleString(isAr ? 'ar-MA' : 'fr-FR')} MAD*`;
    }).join('\n');

    const totalText = isAr 
      ? `\n*المجموع العام: ${totalGeneral.toLocaleString('ar-MA')} MAD*`
      : `\n*Total général: ${totalGeneral.toLocaleString('fr-FR')} MAD*`;

    const footer = isAr 
      ? `\n\nنحن في خدمتكم! ✨`
      : `\n\nÀ votre service! ✨`;

    const fullMessage = greeting + modelsText + "\n" + totalText + footer;
    
    if (clientPhone) {
      const whatsappUrl = `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(fullMessage)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // Just copy to clipboard if no phone number
      navigator.clipboard.writeText(fullMessage);
      alert(isAr ? 'تم نسخ الرسالة للحافظة!' : 'Message copié dans le presse-papiers !');
    }
  };

  const handleSave = async () => {
    if (!clientName) {
      alert(isAr ? 'المرجو إدخال اسم الزبون' : 'Veuillez saisir le nom du client');
      return;
    }
    if (models.length === 0) {
      alert(isAr ? 'المرجو إضافة موديل واحد على الأقل' : 'Veuillez ajouter au moins un modèle');
      return;
    }

    const facId = genId();
    const articles = models.map(m => ({
      id: genId(),
      designation: m.name + (m.fabricType ? ` (${m.fabricType})` : ''),
      quantite: m.quantity,
      prixUnitaire: m.matierePrice + m.laborPrice,
      total: (m.matierePrice + m.laborPrice) * m.quantity
    }));

    const newDevis: Facture = {
      id: facId,
      numero: devisNum,
      client: clientName,
      montant: totalGeneral,
      date: new Date().toISOString().split('T')[0],
      echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statut: 'en_attente',
      typeDoc: 'devis',
      articles: articles,
      avance: acompte
    };

    await saveRecord('factures', newDevis);
    printElement('devis-builder-pdf');
    if (onBack) onBack();
    else navigate('/devis');
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/devis');
  };

  if (loading) {
    return (
      <div className={`p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 ${isAr ? 'text-right' : 'text-left'}`}>
        <PageLoader />
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500 ${isAr ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={handleBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition border border-slate-200 shrink-0">
            <ArrowLeft className={`w-5 h-5 text-slate-600 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">{isAr ? 'إنشاء عرض سعر احترافي' : 'Créer un Devis PRO'}</h1>
            <p className="text-slate-500 mt-1">{isAr ? 'عرض سعر متعدد الموديلات' : 'Devis multi-modèles détaillé'}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition">
            <MessageCircle className="w-4 h-4" /> {isAr ? 'مشاركة عبر واتساب' : 'Partager via WhatsApp'}
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
            <Download className="w-4 h-4" /> {isAr ? 'حفظ وتحميل PDF' : 'Enregistrer & Télécharger PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* CLIENT SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`flex items-center gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">{isAr ? 'معلومات الزبون' : 'Informations du Client'}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'اختر زبون من القائمة' : 'Sélectionner un client existant'}</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-medium"
                  value={selectedClient?.id || ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (!val) {
                      setSelectedClient(null);
                    } else {
                      const client = clients.find(c => c.id === val);
                      const leadMatch = visibleLeads.find(l => l.id === val);
                      
                      let newSelectedClient = null;
                      let phoneToMatch = '';
                      let nameToMatch = '';

                      if (client) {
                        newSelectedClient = { id: client.id, nom: client.nom, telephone: client.telephone || '' };
                        phoneToMatch = client.telephone || '';
                        nameToMatch = client.nom;
                      }
                      else if (leadMatch) {
                        newSelectedClient = { id: leadMatch.id, nom: leadMatch.name, telephone: leadMatch.phone };
                        phoneToMatch = leadMatch.phone;
                        nameToMatch = leadMatch.name;
                      }
                      
                      setSelectedClient(newSelectedClient);

                      // Auto-populate models from leads
                      if (newSelectedClient) {
                        const clientLeadsToImport = visibleLeads.filter(l => 
                          (phoneToMatch && l.phone && (l.phone.includes(phoneToMatch) || phoneToMatch.includes(l.phone))) ||
                          (nameToMatch && l.name && l.name.toLowerCase() === nameToMatch.toLowerCase())
                        );

                        if (clientLeadsToImport.length > 0) {
                          const newModels = clientLeadsToImport.map(lead => ({
                            id: genId(),
                            name: lead.type || '',
                            image: lead.photo || (lead.photos && lead.photos.length > 0 ? lead.photos[0] : ''),
                            quantity: lead.quantity || 1,
                            matierePrice: 0,
                            laborPrice: 0,
                            fabricType: ''
                          }));
                          setModels(newModels);
                        }
                      }
                    }
                  }}
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  <option value="">{isAr ? 'زبون جديد...' : 'Nouveau client...'}</option>
                  
                  {clients.length > 0 && (
                    <optgroup label={isAr ? 'الزبناء الحاليين' : 'Clients Actuels'}>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.telephone ? `(${c.telephone})` : ''}</option>)}
                    </optgroup>
                  )}
                  
                  {visibleLeads.length > 0 && (
                    <optgroup label={isAr ? 'الزبناء المحتملين (Leads)' : 'Prospects (Leads)'}>
                      {visibleLeads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
                    </optgroup>
                  )}
                </select>
              </div>

              {!selectedClient && (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <label className={`block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'اسم الزبون' : 'Nom du client'}</label>
                    <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} dir={isAr ? 'rtl' : 'ltr'} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder={isAr ? 'اسم الشركة أو الشخص...' : 'Nom...'} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ${isAr ? 'text-right' : ''}`}>{isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
                    <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} dir="ltr" className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`} placeholder="+212 6..." />
                  </div>
                </div>
              )}

              {clientLeads.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                  <label className={`block text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3 ${isAr ? 'text-right' : ''}`}>
                    {isAr ? '✨ طلبات هذا الزبون (انقر لإضافتها للتسعير)' : '✨ Demandes de ce client (Cliquez pour ajouter)'}
                  </label>
                  <div className={`flex gap-3 overflow-x-auto pb-2 custom-scrollbar ${isAr ? 'flex-row-reverse' : ''}`}>
                    {clientLeads.map(lead => (
                      <button key={lead.id} onClick={() => importLeadAsModel(lead)}
                        className={`flex items-center gap-3 p-2 pr-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all whitespace-nowrap group shrink-0 ${isAr ? 'flex-row-reverse pl-4 pr-2' : ''}`}>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-indigo-100">
                          {(lead.photo || (lead.photos && lead.photos[0])) ? (
                            <img src={lead.photo || lead.photos![0]} alt={lead.type} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className={isAr ? 'text-right' : 'text-left'}>
                          <p className="text-xs font-bold text-indigo-900">{lead.type || 'Modèle'}</p>
                          <p className="text-[10px] font-bold text-indigo-500">{lead.quantity} pcs</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all ${isAr ? 'mr-2' : 'ml-2'}`}>
                          <Plus className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MODELS SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`flex items-center justify-between mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{isAr ? 'الموديلات والتسعير' : 'Modèles & Tarification'}</h2>
              </div>
            </div>

            <div className="space-y-6">
              {models.map((model, idx) => (
                <div key={model.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 relative group">
                  <button onClick={() => removeModel(model.id)} className={`absolute -top-3 ${isAr ? '-left-3' : '-right-3'} w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full transition-all shadow-md z-10 border border-red-200`} title={isAr ? 'حذف الموديل' : 'Supprimer'}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className={`flex flex-col md:flex-row gap-5 ${isAr ? 'flex-row-reverse md:flex-row-reverse' : ''}`}>
                    {/* Image */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="w-full md:w-32 h-32 bg-white rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center group/img">
                        {model.image ? (
                          <>
                            <img src={model.image} alt="Model" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition">
                              <Camera className="w-6 h-6 text-white" />
                              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                if (e.target.files?.[0]) updateModel(model.id, { image: await compressImage(e.target.files[0]) });
                              }} />
                            </label>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-50 transition">
                            <Camera className="w-6 h-6 text-slate-300 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'صورة' : 'Image'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={async e => {
                              if (e.target.files?.[0]) updateModel(model.id, { image: await compressImage(e.target.files[0]) });
                            }} />
                          </label>
                        )}
                      </div>
                      {model.image && (
                        <button onClick={() => setPreviewImage(model.image)} className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
                          <Maximize2 className="w-3 h-3" /> {isAr ? 'تكبير الصورة' : 'Agrandir'}
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className={`flex gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-1">
                          <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ${isAr ? 'text-right' : ''}`}>{isAr ? 'اسم الموديل' : 'Nom du modèle'}</label>
                          <input type="text" value={model.name} onChange={e => updateModel(model.id, { name: e.target.value })} dir={isAr ? 'rtl' : 'ltr'} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" placeholder="Ex: T-Shirt Oversize..." />
                        </div>
                        <div className="w-24">
                          <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ${isAr ? 'text-right' : ''}`}>{isAr ? 'الكمية' : 'Quantité'}</label>
                          <input type="number" value={model.quantity === 0 ? '' : model.quantity} onChange={e => updateModel(model.id, { quantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 text-center" />
                        </div>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 ${isAr ? 'flex-row-reverse' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'ثمن الثوب والسلعة (درهم)' : 'Prix Matière (MAD)'}</label>
                          <input type="number" value={model.matierePrice === 0 ? '' : model.matierePrice} onChange={e => updateModel(model.id, { matierePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{isAr ? 'ثمن الخياطة (درهم)' : 'Prix Confection (MAD)'}</label>
                          <input type="number" value={model.laborPrice === 0 ? '' : model.laborPrice} onChange={e => updateModel(model.id, { laborPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" placeholder="0.00" />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                          <span>{isAr ? 'تفاصيل السلعة' : 'Détails Matière'}</span>
                        </label>
                        <input type="text" value={model.fabricType} onChange={e => updateModel(model.id, { fabricType: e.target.value })} dir={isAr ? 'rtl' : 'ltr'} className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-indigo-500 ${isAr ? 'text-right' : ''}`} placeholder={isAr ? 'مثال: ثوب قطن 100٪، طباعة...' : 'Ex: Coton 100%, Sérigraphie...'} />
                        <div className={`flex flex-wrap gap-1 mt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                          {(isAr 
                            ? ['الثوب', 'الخيط', 'الطباعة', 'الطرز', 'اللوازم', 'التغليف']
                            : ['Tissu', 'Fil', 'Impression', 'Broderie', 'Fournitures', 'Packaging']
                          ).map(tag => (
                            <button key={tag} onClick={() => updateModel(model.id, { fabricType: model.fabricType ? `${model.fabricType} + ${tag}` : tag })} className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded text-[10px] font-bold transition">
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={addModel} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition font-bold">
                <Plus className="w-5 h-5" /> {isAr ? 'إضافة موديل جديد' : 'Ajouter un modèle'}
              </button>
            </div>
          </div>
        </div>

        {/* SETTINGS & SUMMARY SECTION */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className={`text-lg font-bold text-slate-800 mb-6 ${isAr ? 'text-right' : ''}`}>{isAr ? 'إعدادات العرض' : 'Paramètres du Devis'}</h3>
            
            <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'مدة الإنجاز (أيام)' : 'Délai de réalisation (Jours)'}</label>
                <div className="relative">
                  <Clock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input type="text" value={delai} onChange={e => setDelai(e.target.value)} className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 ${isAr ? 'pr-10 pl-3' : 'pl-10 pr-3'}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{isAr ? 'التسبيق المطلوب (%)' : 'Acompte requis (%)'}</label>
                <div className="flex gap-2">
                  {[30, 50, 70, 100].map(pct => (
                    <button key={pct} onClick={() => setAcomptePercent(pct)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${acomptePercent === pct ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{isAr ? 'مجموع السلعة' : 'Total Matière'}</span>
                  <span className="font-bold text-slate-700" dir="ltr">{totalMatiere.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{isAr ? 'مجموع اليد العاملة' : 'Total Main d\'œuvre'}</span>
                  <span className="font-bold text-slate-700" dir="ltr">{totalLabor.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'المجموع العام' : 'Total Général'}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-800" dir="ltr">{totalGeneral.toLocaleString()} <span className="text-xs">MAD</span></span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex justify-between items-center mt-2">
                  <div>
                    <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isAr ? 'التسبيق' : 'Acompte'} ({acomptePercent}%)</span>
                  </div>
                  <span className="text-lg font-black text-emerald-700" dir="ltr">{acompte.toLocaleString()} <span className="text-xs">MAD</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HIDDEN PDF TEMPLATE */}
      <div id="devis-builder-pdf" className="fixed top-0 left-0 opacity-0 pointer-events-none -z-[100] w-[800px] bg-white font-sans" style={{ color: '#0f172a', direction: isAr ? 'rtl' : 'ltr' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4f46e5', padding: '20px 32px 14px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            {company.logoInvoice && company.logoInvoice !== '/logo.png' ? (
              <img src={company.logoInvoice} alt="Logo" style={{ height: '44px', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '44px', height: '44px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px' }}>
                {company.name?.charAt(0) || 'B'}
              </div>
            )}
            <div style={{ textAlign: isAr ? 'right' : 'left' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0, textTransform: 'uppercase' }}>{company.name || 'BEYA CREATIVE'}</h1>
              <p style={{ fontSize: '8px', fontWeight: 700, color: '#6366f1', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{company.subtitle || (isAr ? 'صناعة النسيج' : 'Confection Textile')}</p>
            </div>
          </div>
          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1e1b4b', textTransform: 'uppercase' }}>{isAr ? 'عرض سعر رسمي' : 'DEVIS OFFICIEL'}</h2>
            <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', margin: '2px 0 0' }}>{isAr ? 'رقم' : 'N°'} {devisNum} — {new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* EMETTEUR / CLIENT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '12px 32px', fontSize: '11px', direction: isAr ? 'rtl' : 'ltr' }}>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
            <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'المُصْدِر (الشركة)' : 'Émetteur'}</h3>
            <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{company.name}</p>
            <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{company.address}</p>
            <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }}>{isAr ? 'الهاتف:' : 'Tél:'} <span dir="ltr">{company.phone}</span></p>
            {company.ice && company.ice !== '000000000000000' && <p style={{ fontWeight: 600, color: '#94a3b8', margin: '3px 0 0', fontSize: '9px' }}>ICE: {company.ice}</p>}
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: isAr ? 'right' : 'left' }}>
            <h3 style={{ fontSize: '8px', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px' }}>{isAr ? 'الزبون / المستلم' : 'Client / Destinataire'}</h3>
            <p style={{ fontWeight: 900, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase' }}>{clientName || 'N/A'}</p>
            <p style={{ fontWeight: 600, color: '#64748b', margin: '0 0 1px', fontSize: '10px' }} dir="ltr">{clientPhone || 'N/A'}</p>
          </div>
        </div>

        {/* DELAI & OBJET */}
        <div style={{ margin: '0 32px 10px', display: 'flex', gap: '10px', direction: isAr ? 'rtl' : 'ltr' }}>
          <div style={{ flex: 1, background: '#eef2ff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #c7d2fe', textAlign: isAr ? 'right' : 'left' }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#4338ca' }}>
              {isAr ? 'الموضوع : عرض سعر متعدد الموديلات' : 'Objet : Devis Confection Multi-Modèles'}
            </p>
          </div>
          <div style={{ background: '#fef2f2', padding: '8px 14px', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#b91c1c' }}>
              {isAr ? 'مدة الإنجاز: ' : 'Délai: '} {delai} {isAr ? 'أيام' : 'Jours'}
            </p>
          </div>
        </div>

        {/* MODELS TABLE */}
        <div style={{ margin: '0 32px 14px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', direction: isAr ? 'rtl' : 'ltr' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: 'white' }}>
                <th style={{ width: '60px', padding: '8px', textAlign: 'center', borderRadius: isAr ? '0 8px 0 0' : '8px 0 0 0' }}>{isAr ? 'صورة' : 'Img'}</th>
                <th style={{ padding: '8px', textAlign: isAr ? 'right' : 'left', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'الموديل والتفاصيل' : 'Modèle & Détails'}</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'الكمية' : 'Qté'}</th>
                <th style={{ padding: '8px', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase' }}>{isAr ? 'ثمن الوحدة' : 'PU'}</th>
                <th style={{ padding: '8px', textAlign: isAr ? 'left' : 'right', fontWeight: 900, textTransform: 'uppercase', borderRadius: isAr ? '8px 0 0 0' : '0 8px 0 0' }}>{isAr ? 'المجموع' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {m.image ? <img src={m.image} alt={m.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} /> : <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '6px' }}></div>}
                  </td>
                  <td style={{ padding: '8px', textAlign: isAr ? 'right' : 'left', verticalAlign: 'middle' }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 900, fontSize: '11px', color: '#1e293b' }}>{m.name || (isAr ? 'موديل بدون اسم' : 'Modèle sans nom')}</p>
                    <p style={{ margin: 0, fontSize: '9px', color: '#64748b', fontWeight: 600 }}>{m.fabricType}</p>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, verticalAlign: 'middle' }}>{m.quantity}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#475569', verticalAlign: 'middle' }} dir="ltr">{(m.matierePrice + m.laborPrice).toFixed(2)}</td>
                  <td style={{ padding: '8px', textAlign: isAr ? 'left' : 'right', fontWeight: 900, verticalAlign: 'middle' }} dir="ltr">{((m.matierePrice + m.laborPrice) * m.quantity).toLocaleString(isAr ? 'ar-MA' : 'fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CHARTE QUALITE & TOTALS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 32px 14px', gap: '24px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          
          {/* COMPACT CHARTE QUALITE */}
          <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', direction: isAr ? 'rtl' : 'ltr' }}>
             <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
                {isAr ? 'ميثاق الجودة BEYA' : 'LA CHARTE QUALITÉ BEYA'}
             </h3>
             <p style={{ fontSize: '8px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                {isAr 
                  ? `نعتمد مسار إنتاج صارم لضمان جودة عالية. هذا العرض يمثل التزاماً مبدئياً. مدة الإنجاز ${delai} يوماً تبدأ بعد دفع التسبيق.`
                  : `Nous garantissons une qualité irréprochable via un processus strict. Ce devis vaut contrat d'engagement. Délai de réalisation: ${delai} jours après acompte.`}
             </p>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <div style={{ fontSize: '9px', fontWeight: 800, color: '#4f46e5', marginBottom: '2px' }}>1. {isAr ? 'التسبيق' : 'Acompte'}</div>
                   <div style={{ fontSize: '7px', color: '#64748b', lineHeight: '1.3' }}>{isAr ? 'يؤكد الطلب وشراء الثوب' : 'Valide la commande et le tissu'}</div>
                </div>
                <div style={{ background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <div style={{ fontSize: '9px', fontWeight: 800, color: '#d97706', marginBottom: '2px' }}>2. {isAr ? 'العينة' : 'Échantillon'}</div>
                   <div style={{ fontSize: '7px', color: '#64748b', lineHeight: '1.3' }}>{isAr ? 'صناعة النموذج الأول للمراجعة' : 'Création du 1er prototype'}</div>
                </div>
                <div style={{ background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <div style={{ fontSize: '9px', fontWeight: 800, color: '#059669', marginBottom: '2px' }}>3. {isAr ? 'الموافقة' : 'Validation'}</div>
                   <div style={{ fontSize: '7px', color: '#64748b', lineHeight: '1.3' }}>{isAr ? 'مراجعة وقبول الزبون النهائي' : 'Vérification et feu vert (OK)'}</div>
                </div>
                <div style={{ background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                   <div style={{ fontSize: '9px', fontWeight: 800, color: '#2563eb', marginBottom: '2px' }}>4. {isAr ? 'الإنتاج' : 'Production'}</div>
                   <div style={{ fontSize: '7px', color: '#64748b', lineHeight: '1.3' }}>{isAr ? 'الإنتاج الشامل والتسليم' : 'Production globale et livraison'}</div>
                </div>
             </div>
          </div>

          {/* TOTALS */}
          <div style={{ width: '300px', direction: isAr ? 'rtl' : 'ltr', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
              <span>{isAr ? 'مجموع السلعة' : 'Sous-total Matière'}</span>
              <span style={{ fontWeight: 800 }} dir="ltr">{totalMatiere.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <span>{isAr ? 'مجموع اليد العاملة' : 'Sous-total MO'}</span>
              <span style={{ fontWeight: 800 }} dir="ltr">{totalLabor.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white', padding: '12px 16px', borderRadius: '12px 12px 0 0', marginTop: '12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-1px' }} dir="ltr">{totalGeneral.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '12px', fontWeight: 800 }}>MAD</span></span>
              <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, display: 'block' }}>{isAr ? 'المجموع العام' : 'Total Général'}</span>
                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>TTC</span>
              </div>
            </div>
            {/* ACOMPTE HIGHLIGHT */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px 16px', borderRadius: '0 0 12px 12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: '18px', fontWeight: 900 }} dir="ltr">{acompte.toLocaleString(isAr ? 'ar-MA' : 'fr-FR', { minimumFractionDigits: 2 })} <span style={{ fontSize: '10px' }}>MAD</span></span>
              <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>{isAr ? 'التسبيق المطلوب' : 'Acompte requis'}</span>
                <span style={{ fontSize: '8px', fontWeight: 600, opacity: 0.9 }}>{isAr ? `${acomptePercent}% لتأكيد الطلب` : `${acomptePercent}% à la commande`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ margin: '30px 32px 0', borderTop: '2px solid #e2e8f0', paddingTop: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 3px' }}>
            {isAr ? `شكرا على ثقتكم — ${company.name}` : `Merci de votre confiance — ${company.name}`}
          </p>
          <p style={{ fontSize: '8px', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
            {company.address} | <span dir="ltr">{company.phone}</span> | {company.email}
          </p>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-rose-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
