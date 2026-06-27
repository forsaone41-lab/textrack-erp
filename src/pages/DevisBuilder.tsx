import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2, Camera, Download, FileText, CheckCircle, Clock, User as UserIcon } from 'lucide-react';
import { FicheTechnique, loadData, loadCompanyProfile, genId, Facture, saveRecord } from '../types';
import type { User } from '../types';
import { useLang } from '../contexts/LangContext';
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

export default function DevisBuilder() {
  const { lang, isAr } = useLang();
  const navigate = useNavigate();
  const company = loadCompanyProfile();

  const [clients, setClients] = useState<User[]>([]);
  const [fiches, setFiches] = useState<FicheTechnique[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);

  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  const [models, setModels] = useState<ModelItem[]>([]);
  
  const [delai, setDelai] = useState('15');
  const [acomptePercent, setAcomptePercent] = useState(50);
  const [devisNum, setDevisNum] = useState('');

  useEffect(() => {
    Promise.all([
      loadData<User>('utilisateurs'),
      loadData<FicheTechnique>('fiches_techniques'),
      loadData<Facture>('factures')
    ]).then(([users, fchs, facs]) => {
      setClients(users.filter(u => u.role === 'client'));
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
      statut: 'en_attente',
      typeDoc: 'devis',
      articles: articles,
      avance: acompte
    };

    await saveRecord('factures', newDevis);
    printElement('devis-builder-pdf');
    navigate('/devis');
  };

  return (
    <div className={`p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500 ${isAr ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => navigate('/devis')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition border border-slate-200">
            <ArrowLeft className={`w-5 h-5 text-slate-600 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">{isAr ? 'إنشاء عرض سعر احترافي' : 'Créer un Devis PRO'}</h1>
            <p className="text-slate-500 mt-1">{isAr ? 'عرض سعر متعدد الموديلات' : 'Devis multi-modèles détaillé'}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
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
                    if (!e.target.value) setSelectedClient(null);
                    else setSelectedClient(clients.find(c => c.id === e.target.value) || null);
                  }}
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  <option value="">{isAr ? 'زبون جديد...' : 'Nouveau client...'}</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.telephone})</option>)}
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
                  <button onClick={() => removeModel(model.id)} className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className={`flex flex-col md:flex-row gap-5 ${isAr ? 'flex-row-reverse md:flex-row-reverse' : ''}`}>
                    {/* Image */}
                    <div className="w-full md:w-32 h-32 bg-white rounded-xl border border-slate-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center group/img">
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

        {/* TOTALS */}
        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', margin: '0 32px 14px' }}>
          <div style={{ width: '320px', direction: isAr ? 'rtl' : 'ltr' }}>
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

        {/* PAGE 2 : CHARTE QUALITE ET PROCESSUS */}
        <div style={{ pageBreakBefore: 'always', padding: '40px 32px', direction: isAr ? 'rtl' : 'ltr' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', textTransform: 'uppercase', margin: 0 }}>{isAr ? 'ميثاق الجودة والعمل' : 'LA CHARTE QUALITÉ BEYA'}</h2>
            <p style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', margin: '6px 0 0' }}>{isAr ? 'ضمانكم للتميز والاحترافية' : "Votre Garantie d'Excellence"}</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#334155', lineHeight: '1.6', margin: 0, textAlign: 'justify' }}>
              {isAr 
                ? `لضمان منتوج نهائي بجودة عالية وخدمة شفافة بالكامل، نعتمد على مسار إنتاج صارم يمر عبر 4 مراحل أساسية. يُعتبر هذا العرض بمثابة عقد التزام مبدئي بين ${company.name} و ${clientName || 'الزبون'}. مدة الإنجاز المتفق عليها هي ${delai} يوماً تبدأ من تاريخ دفع التسبيق.`
                : `Afin de vous garantir un produit final d'une qualité irréprochable et un service totalement transparent, nous avons mis en place un processus de production strict en 4 étapes. Ce devis fait office de contrat d'engagement entre ${company.name} et ${clientName || 'le client'}. Le délai de réalisation convenu est de ${delai} jours à compter du paiement de l'acompte.`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Etape 1 */}
            <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #4f46e5', borderRight: isAr ? '4px solid #4f46e5' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'الموافقة ودفع التسبيق' : 'Accord & Acompte'}</h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                  {isAr 
                    ? `دفع التسبيق المقدر بـ ${acomptePercent}% يُعتبر موافقة رسمية وتأكيداً للطلب. يتم بعدها مباشرة اقتناء الأثواب والمواد الأولية.`
                    : `Le paiement de l'acompte de ${acomptePercent}% valide officiellement la commande. Nous procédons ensuite immédiatement à l'achat des matières premières.`}
                </p>
              </div>
            </div>

            {/* Etape 2 */}
            <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #f59e0b', borderRight: isAr ? '4px solid #f59e0b' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'صناعة العينة (Echantillon)' : "Création de l'Échantillon"}</h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                  {isAr 
                    ? `نقوم بصناعة العينة الأولى لكل موديل وعرضها عليكم عبر الصور أو الفيديو أو الإرسال الفعلي للتأكد من المقاسات والتفاصيل.`
                    : `Nous confectionnons le premier prototype pour chaque modèle et vous le présentons (photo, vidéo ou envoi physique) pour validation des mesures et détails.`}
                </p>
              </div>
            </div>

            {/* Etape 3 */}
            <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #10b981', borderRight: isAr ? '4px solid #10b981' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'مصادقة الزبون (OK)' : 'Validation Client (OK)'}</h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                  {isAr 
                    ? `لا يتم إطلاق الإنتاج الكلي إلا بعد إعطائكم الضوء الأخضر والمصادقة النهائية على العينات.`
                    : `La production en série n'est lancée qu'après votre feu vert et la validation finale explicite des échantillons.`}
                </p>
              </div>
            </div>

            {/* Etape 4 */}
            <div style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderLeft: isAr ? 'none' : '4px solid #3b82f6', borderRight: isAr ? '4px solid #3b82f6' : 'none', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>4</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e1b4b', margin: '0 0 6px', textTransform: 'uppercase' }}>{isAr ? 'الإنتاج الكلي' : 'Production Globale'}</h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                  {isAr 
                    ? `يبدأ الإنتاج الكلي باحترام تام للعينات المصادق عليها وفي حدود مدة الإنجاز المتفق عليها (${delai} أيام).`
                    : `La production en série démarre dans le respect total des échantillons validés et dans la limite du délai convenu (${delai} jours).`}
                </p>
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
    </div>
  );
}
